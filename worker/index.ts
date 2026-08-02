import { isLocalEmailCapture, sendAuthEmail } from './email';

const encoder = new TextEncoder();
const SESSION_COOKIE = 'shi_lab_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
// Cloudflare Workers caps PBKDF2 at 100,000 iterations.
const PASSWORD_ITERATIONS = 100_000;
const MAX_BODY_LENGTH = 8_192;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_ATTEMPTS = 8;
const EMAIL_RATE_LIMIT_ATTEMPTS = 3;
const VERIFY_EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1_000;
const RESET_PASSWORD_TOKEN_TTL_MS = 30 * 60 * 1_000;

type UserRole = 'member' | 'admin';
type UserStatus = 'active' | 'disabled';

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified_at: string | null;
};

type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
};

type SessionContext = {
  tokenHash: string;
  user: UserRow;
};

type AttemptRow = {
  attempts: number;
  window_started_at: number;
};

type AuthEmailPurpose = 'verify_email' | 'reset_password';

type EmailTokenRow = {
  token_hash: string;
  user_id: string;
  purpose: AuthEmailPurpose;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
};

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  responseHeaders.set('cache-control', 'no-store');
  responseHeaders.set('x-content-type-options', 'nosniff');
  responseHeaders.set('referrer-policy', 'same-origin');
  responseHeaders.set('vary', 'Cookie');
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function publicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    emailVerified: Boolean(user.email_verified_at),
    emailVerifiedAt: user.email_verified_at,
  };
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin;
}

async function readJson(request: Request): Promise<Record<string, unknown> | Response> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: '请求格式必须为 JSON。' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_LENGTH) {
    return json({ error: '请求内容过大。' }, 413);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    return json({ error: '请求内容过大。' }, 413);
  }

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return json({ error: '请求内容无效。' }, 400);
    }
    return value as Record<string, unknown>;
  } catch {
    return json({ error: 'JSON 格式无效。' }, 400);
  }
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeDisplayName(value: unknown, email: string): string {
  if (typeof value !== 'string' || !value.trim()) return email.split('@')[0].slice(0, 40);
  return value.trim().slice(0, 40);
}

function validateEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: unknown): password is string {
  return (
    typeof password === 'string' &&
    password.length >= 10 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function randomToken(size = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return bytesToBase64(bytes)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function derivePassword(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    key,
    256,
  );
  return new Uint8Array(bits);
}

async function passwordRecord(password: string): Promise<{
  hash: string;
  salt: string;
  iterations: number;
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return {
    hash: bytesToBase64(hash),
    salt: bytesToBase64(salt),
    iterations: PASSWORD_ITERATIONS,
  };
}

async function passwordMatches(password: string, user: UserRow): Promise<boolean> {
  const expected = base64ToBytes(user.password_hash);
  const actual = await derivePassword(
    password,
    base64ToBytes(user.password_salt),
    user.password_iterations,
  );
  if (expected.length !== actual.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected[index] ^ actual[index];
  }
  return difference === 0;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function sessionCookie(token: string, maxAge = SESSION_MAX_AGE_SECONDS): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

async function sessionContext(request: Request, env: Env): Promise<SessionContext | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const user = await env.DB.prepare(
    `SELECT users.*
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
        AND sessions.expires_at > ?
        AND users.status = 'active'
      LIMIT 1`,
  )
    .bind(tokenHash, now)
    .first<UserRow>();
  return user ? { tokenHash, user } : null;
}

async function issueSession(env: Env, userId: string): Promise<string> {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1_000);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now.toISOString()),
    env.DB.prepare(
      'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
    ).bind(tokenHash, userId, now.toISOString(), expiresAt.toISOString()),
  ]);
  return token;
}

async function attemptKey(request: Request, email: string, action: string): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  return sha256(`${action}\n${ip}\n${email}`);
}

async function takeAuthAttempt(
  request: Request,
  env: Env,
  email: string,
  action: string,
  maxAttempts = RATE_LIMIT_ATTEMPTS,
): Promise<{ allowed: boolean; key: string }> {
  const key = await attemptKey(request, email, action);
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO auth_attempts (attempt_key, attempts, window_started_at)
     VALUES (?, 1, ?)
     ON CONFLICT(attempt_key)
     DO UPDATE SET
       attempts = CASE
         WHEN auth_attempts.window_started_at <= ?
           THEN 1
         ELSE auth_attempts.attempts + 1
       END,
       window_started_at = CASE
         WHEN auth_attempts.window_started_at <= ?
           THEN excluded.window_started_at
         ELSE auth_attempts.window_started_at
       END
     RETURNING attempts, window_started_at`,
  )
    .bind(key, now, now - RATE_LIMIT_WINDOW_MS, now - RATE_LIMIT_WINDOW_MS)
    .first<AttemptRow>();

  return { allowed: Boolean(row && row.attempts <= maxAttempts), key };
}

async function clearAuthAttempt(env: Env, key: string): Promise<void> {
  await env.DB.prepare('DELETE FROM auth_attempts WHERE attempt_key = ?').bind(key).run();
}

async function issueEmailToken(
  env: Env,
  userId: string,
  purpose: AuthEmailPurpose,
  ttlMs: number,
): Promise<{ token: string; tokenHash: string }> {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);
  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM auth_email_tokens
        WHERE expires_at <= ? OR consumed_at IS NOT NULL`,
    ).bind(now.toISOString()),
    env.DB.prepare(
      `INSERT INTO auth_email_tokens (
        token_hash, user_id, purpose, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?)`,
    ).bind(
      tokenHash,
      userId,
      purpose,
      now.toISOString(),
      expiresAt.toISOString(),
    ),
  ]);
  return { token, tokenHash };
}

async function deliverEmailToken(
  request: Request,
  env: Env,
  user: UserRow,
  purpose: AuthEmailPurpose,
): Promise<string | undefined> {
  const ttl = purpose === 'verify_email'
    ? VERIFY_EMAIL_TOKEN_TTL_MS
    : RESET_PASSWORD_TOKEN_TTL_MS;
  const issued = await issueEmailToken(env, user.id, purpose, ttl);
  try {
    await sendAuthEmail(request, env, {
      purpose,
      recipient: user.email,
      token: issued.token,
      idempotencyKey: `${purpose}-${issued.tokenHash.slice(0, 32)}`,
    });
  } catch (error) {
    await env.DB.prepare('DELETE FROM auth_email_tokens WHERE token_hash = ?')
      .bind(issued.tokenHash)
      .run();
    throw error;
  }
  return isLocalEmailCapture(request, env) ? issued.token : undefined;
}

async function consumeEmailToken(
  env: Env,
  token: unknown,
  purpose: AuthEmailPurpose,
): Promise<EmailTokenRow | null> {
  if (typeof token !== 'string' || token.length < 32 || token.length > 128) return null;
  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const tokenRow = await env.DB.prepare(
    `SELECT * FROM auth_email_tokens
      WHERE token_hash = ?
        AND purpose = ?
        AND consumed_at IS NULL
        AND expires_at > ?
      LIMIT 1`,
  )
    .bind(tokenHash, purpose, now)
    .first<EmailTokenRow>();
  if (!tokenRow) return null;

  const consumed = await env.DB.prepare(
    `UPDATE auth_email_tokens
        SET consumed_at = ?
      WHERE token_hash = ?
        AND consumed_at IS NULL
        AND expires_at > ?`,
  )
    .bind(now, tokenHash, now)
    .run();
  return Number(consumed.meta.changes) === 1 ? tokenRow : null;
}

async function register(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const email = normalizeEmail(body.email);
  const password = body.password;
  const displayName = normalizeDisplayName(body.displayName, email);

  if (!validateEmail(email)) return json({ error: '请输入有效的邮箱地址。' }, 400);
  if (!validatePassword(password)) {
    return json({ error: '密码需为 10–128 位，并同时包含字母和数字。' }, 400);
  }
  if (displayName.length < 2) return json({ error: '昵称至少需要 2 个字符。' }, 400);

  const attempt = await takeAuthAttempt(request, env, email, 'register');
  if (!attempt.allowed) return json({ error: '尝试次数过多，请 15 分钟后再试。' }, 429);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<{ id: string }>();
  if (existing) return json({ error: '该邮箱已经注册，请直接登录。' }, 409);

  const passwordData = await passwordRecord(password);
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const inserted = await env.DB.prepare(
    `INSERT OR IGNORE INTO users (
       id, email, display_name, password_hash, password_salt, password_iterations,
       role, status, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, 'member', 'active', ?, ?)`,
  )
    .bind(
      userId,
      email,
      displayName,
      passwordData.hash,
      passwordData.salt,
      passwordData.iterations,
      now,
      now,
    )
    .run();
  if (Number(inserted.meta.changes) !== 1) {
    return json({ error: '该邮箱已经注册，请直接登录。' }, 409);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first<UserRow>();
  if (!user) return json({ error: '账号创建失败，请稍后重试。' }, 500);

  await clearAuthAttempt(env, attempt.key);
  let debugToken: string | undefined;
  try {
    debugToken = await deliverEmailToken(request, env, user, 'verify_email');
  } catch (error) {
    console.error(JSON.stringify({
      event: 'verification_email_failed',
      userId: user.id,
      message: error instanceof Error ? error.message : 'unknown_error',
    }));
    return json({
      error: '账号已创建，但验证邮件暂时发送失败。请在登录页选择“重发验证邮件”。',
      code: 'EMAIL_DELIVERY_FAILED',
      email,
    }, 503);
  }
  console.log(JSON.stringify({ event: 'user_registered', userId: user.id }));
  return json({
    ok: true,
    authenticated: false,
    requiresVerification: true,
    email,
    message: '验证邮件已发送，请在 24 小时内完成验证。',
    ...(debugToken ? { debugToken } : {}),
  }, 201);
}

async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!validateEmail(email) || typeof password !== 'string') {
    return json({ error: '邮箱或密码不正确。' }, 401);
  }

  const attempt = await takeAuthAttempt(request, env, email, 'login');
  if (!attempt.allowed) return json({ error: '尝试次数过多，请 15 分钟后再试。' }, 429);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<UserRow>();
  const matches = user ? await passwordMatches(password, user) : false;
  if (!user || !matches || user.status !== 'active') {
    return json({ error: '邮箱或密码不正确。' }, 401);
  }
  if (!user.email_verified_at) {
    return json({
      error: '该邮箱尚未验证，请先检查收件箱。',
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
    }, 403);
  }

  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
    .bind(now, now, user.id)
    .run();
  user.last_login_at = now;
  user.updated_at = now;
  const token = await issueSession(env, user.id);
  await clearAuthAttempt(env, attempt.key);
  console.log(JSON.stringify({ event: 'user_login', userId: user.id }));
  return json(
    { authenticated: true, user: publicUser(user) },
    200,
    { 'set-cookie': sessionCookie(token) },
  );
}

async function resendVerification(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const email = normalizeEmail(body.email);
  if (!validateEmail(email)) return json({ error: '请输入有效的邮箱地址。' }, 400);

  const attempt = await takeAuthAttempt(
    request,
    env,
    email,
    'resend_verification',
    EMAIL_RATE_LIMIT_ATTEMPTS,
  );
  if (!attempt.allowed) {
    return json({ error: '发送次数过多，请 15 分钟后再试。' }, 429);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<UserRow>();
  let debugToken: string | undefined;
  if (user && user.status === 'active' && !user.email_verified_at) {
    try {
      debugToken = await deliverEmailToken(request, env, user, 'verify_email');
    } catch (error) {
      console.error(JSON.stringify({
        event: 'verification_email_failed',
        userId: user.id,
        message: error instanceof Error ? error.message : 'unknown_error',
      }));
      return json({ error: '验证邮件暂时发送失败，请稍后重试。' }, 503);
    }
  }

  return json({
    ok: true,
    message: '如果该邮箱存在且尚未验证，新的验证邮件已经发送。',
    ...(debugToken ? { debugToken } : {}),
  });
}

async function verifyEmail(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const tokenRow = await consumeEmailToken(env, body.token, 'verify_email');
  if (!tokenRow) {
    return json({ error: '验证链接无效或已过期，请重新发送验证邮件。' }, 400);
  }

  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE users
          SET email_verified_at = COALESCE(email_verified_at, ?), updated_at = ?
        WHERE id = ? AND status = 'active'`,
    ).bind(now, now, tokenRow.user_id),
    env.DB.prepare(
      `UPDATE auth_email_tokens
          SET consumed_at = COALESCE(consumed_at, ?)
        WHERE user_id = ? AND purpose = 'verify_email'`,
    ).bind(now, tokenRow.user_id),
  ]);
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(tokenRow.user_id)
    .first<UserRow>();
  if (!user || user.status !== 'active') return json({ error: '账号不可用。' }, 403);

  const sessionToken = await issueSession(env, user.id);
  console.log(JSON.stringify({ event: 'email_verified', userId: user.id }));
  return json(
    { authenticated: true, user: publicUser(user), message: '邮箱验证成功。' },
    200,
    { 'set-cookie': sessionCookie(sessionToken) },
  );
}

async function requestPasswordReset(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const email = normalizeEmail(body.email);
  if (!validateEmail(email)) return json({ error: '请输入有效的邮箱地址。' }, 400);

  const attempt = await takeAuthAttempt(
    request,
    env,
    email,
    'forgot_password',
    EMAIL_RATE_LIMIT_ATTEMPTS,
  );
  if (!attempt.allowed) {
    return json({ error: '发送次数过多，请 15 分钟后再试。' }, 429);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<UserRow>();
  let debugToken: string | undefined;
  if (user && user.status === 'active') {
    try {
      debugToken = await deliverEmailToken(request, env, user, 'reset_password');
    } catch (error) {
      console.error(JSON.stringify({
        event: 'password_reset_email_failed',
        userId: user.id,
        message: error instanceof Error ? error.message : 'unknown_error',
      }));
    }
  }

  return json({
    ok: true,
    message: '如果该邮箱已注册，密码重置邮件将在几分钟内送达。',
    ...(debugToken ? { debugToken } : {}),
  });
}

async function resetPassword(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const nextPassword = body.password;
  if (!validatePassword(nextPassword)) {
    return json({ error: '新密码需为 10–128 位，并同时包含字母和数字。' }, 400);
  }

  const tokenRow = await consumeEmailToken(env, body.token, 'reset_password');
  if (!tokenRow) {
    return json({ error: '重置链接无效或已过期，请重新申请。' }, 400);
  }

  const passwordData = await passwordRecord(nextPassword);
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE users
          SET password_hash = ?,
              password_salt = ?,
              password_iterations = ?,
              email_verified_at = COALESCE(email_verified_at, ?),
              updated_at = ?
        WHERE id = ? AND status = 'active'`,
    ).bind(
      passwordData.hash,
      passwordData.salt,
      passwordData.iterations,
      now,
      now,
      tokenRow.user_id,
    ),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(tokenRow.user_id),
    env.DB.prepare(
      `UPDATE auth_email_tokens
          SET consumed_at = COALESCE(consumed_at, ?)
        WHERE user_id = ? AND purpose = 'reset_password'`,
    ).bind(now, tokenRow.user_id),
  ]);
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(tokenRow.user_id)
    .first<UserRow>();
  if (!user || user.status !== 'active') return json({ error: '账号不可用。' }, 403);

  const sessionToken = await issueSession(env, user.id);
  console.log(JSON.stringify({ event: 'password_reset', userId: user.id }));
  return json(
    { authenticated: true, user: publicUser(user), message: '密码已重置。' },
    200,
    { 'set-cookie': sessionCookie(sessionToken) },
  );
}

async function logout(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .bind(await sha256(token))
      .run();
  }
  return json(
    { authenticated: false },
    200,
    { 'set-cookie': sessionCookie('', 0) },
  );
}

async function updateProfile(request: Request, env: Env, session: SessionContext): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const displayName = normalizeDisplayName(body.displayName, session.user.email);
  if (displayName.length < 2) return json({ error: '昵称至少需要 2 个字符。' }, 400);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?')
    .bind(displayName, now, session.user.id)
    .run();
  session.user.display_name = displayName;
  session.user.updated_at = now;
  return json({ user: publicUser(session.user) });
}

async function updatePassword(
  request: Request,
  env: Env,
  session: SessionContext,
): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const currentPassword = body.currentPassword;
  const nextPassword = body.nextPassword;
  if (typeof currentPassword !== 'string' || !(await passwordMatches(currentPassword, session.user))) {
    return json({ error: '当前密码不正确。' }, 401);
  }
  if (!validatePassword(nextPassword)) {
    return json({ error: '新密码需为 10–128 位，并同时包含字母和数字。' }, 400);
  }

  const passwordData = await passwordRecord(nextPassword);
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE users
          SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = ?
        WHERE id = ?`,
    ).bind(
      passwordData.hash,
      passwordData.salt,
      passwordData.iterations,
      now,
      session.user.id,
    ),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').bind(
      session.user.id,
      session.tokenHash,
    ),
  ]);
  console.log(JSON.stringify({ event: 'password_changed', userId: session.user.id }));
  return json({ ok: true });
}

async function listUsers(request: Request, env: Env): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 80) ?? '';
  const pattern = `%${query}%`;
  const result = await env.DB.prepare(
    `SELECT id, email, display_name, role, status, created_at, updated_at,
            last_login_at, email_verified_at
       FROM users
      WHERE ? = '' OR email LIKE ? OR display_name LIKE ?
      ORDER BY created_at DESC
      LIMIT 250`,
  )
    .bind(query, pattern, pattern)
    .all<Omit<UserRow, 'password_hash' | 'password_salt' | 'password_iterations'>>();

  return json({
    users: result.results.map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      emailVerified: Boolean(user.email_verified_at),
      emailVerifiedAt: user.email_verified_at,
    })),
  });
}

async function updateUser(
  request: Request,
  env: Env,
  admin: SessionContext,
  userId: string,
): Promise<Response> {
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const role = body.role;
  const status = body.status;
  const nextRole = role === 'member' || role === 'admin' ? role : undefined;
  const nextStatus = status === 'active' || status === 'disabled' ? status : undefined;
  if (!nextRole && !nextStatus) return json({ error: '没有可更新的用户字段。' }, 400);

  const target = await env.DB.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(userId)
    .first<UserRow>();
  if (!target) return json({ error: '用户不存在。' }, 404);
  if (
    target.id === admin.user.id &&
    ((nextRole && nextRole !== target.role) || (nextStatus && nextStatus !== target.status))
  ) {
    return json({ error: '不能在用户管理页停用或降级自己的管理员账号。' }, 400);
  }

  if (
    target.role === 'admin' &&
    target.status === 'active' &&
    (nextRole === 'member' || nextStatus === 'disabled')
  ) {
    const activeAdmins = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND status = 'active'`,
    ).first<{ count: number }>();
    if (!activeAdmins || Number(activeAdmins.count) <= 1) {
      return json({ error: '至少需要保留一名启用中的管理员。' }, 400);
    }
  }

  const updatedRole = nextRole ?? target.role;
  const updatedStatus = nextStatus ?? target.status;
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET role = ?, status = ?, updated_at = ? WHERE id = ?').bind(
      updatedRole,
      updatedStatus,
      now,
      target.id,
    ),
    ...(updatedStatus === 'disabled'
      ? [env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id)]
      : []),
  ]);

  target.role = updatedRole;
  target.status = updatedStatus;
  target.updated_at = now;
  console.log(JSON.stringify({
    event: 'admin_user_updated',
    adminUserId: admin.user.id,
    targetUserId: target.id,
    role: updatedRole,
    status: updatedStatus,
  }));
  return json({ user: publicUser(target) });
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const stateChanging = request.method !== 'GET' && request.method !== 'HEAD';
  if (stateChanging && !isSameOrigin(request)) {
    return json({ error: '请求来源无效。' }, 403);
  }

  if (path === '/api/auth/register' && request.method === 'POST') return register(request, env);
  if (path === '/api/auth/login' && request.method === 'POST') return login(request, env);
  if (path === '/api/auth/resend-verification' && request.method === 'POST') {
    return resendVerification(request, env);
  }
  if (path === '/api/auth/verify-email' && request.method === 'POST') {
    return verifyEmail(request, env);
  }
  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    return requestPasswordReset(request, env);
  }
  if (path === '/api/auth/reset-password' && request.method === 'POST') {
    return resetPassword(request, env);
  }
  if (path === '/api/auth/logout' && request.method === 'POST') return logout(request, env);

  const session = await sessionContext(request, env);
  if (path === '/api/auth/me' && request.method === 'GET') {
    return json(session
      ? { authenticated: true, user: publicUser(session.user) }
      : { authenticated: false });
  }
  if (!session) return json({ error: '请先登录。' }, 401);

  if (path === '/api/account/profile' && request.method === 'PATCH') {
    return updateProfile(request, env, session);
  }
  if (path === '/api/account/password' && request.method === 'POST') {
    return updatePassword(request, env, session);
  }

  if (!path.startsWith('/api/admin/')) return json({ error: '接口不存在。' }, 404);
  if (session.user.role !== 'admin') return json({ error: '需要管理员权限。' }, 403);
  if (path === '/api/admin/users' && request.method === 'GET') return listUsers(request, env);
  const userMatch = path.match(/^\/api\/admin\/users\/([0-9a-f-]+)$/i);
  if (userMatch && request.method === 'PATCH') {
    return updateUser(request, env, session, userMatch[1]);
  }
  return json({ error: '管理接口不存在。' }, 404);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      const response = await env.ASSETS.fetch(request);
      if (
        response.status !== 404 ||
        (request.method !== 'GET' && request.method !== 'HEAD') ||
        !/%[0-9A-Fa-f]{2}/.test(url.pathname)
      ) {
        return response;
      }

      // Next's static export keeps an encoded MDX slug as a literal directory
      // name. Cloudflare decodes the public URL once before resolving assets, so
      // retry with escaped percent signs while keeping the canonical URL intact.
      const encodedAssetUrl = new URL(url);
      encodedAssetUrl.pathname = url.pathname.replaceAll('%', '%25');
      const encodedResponse = await env.ASSETS.fetch(
        new Request(encodedAssetUrl.toString(), request),
      );
      return encodedResponse.status === 404 ? response : encodedResponse;
    }

    try {
      return await api(request, env);
    } catch (error) {
      console.error(JSON.stringify({
        event: 'api_error',
        path: url.pathname,
        message: error instanceof Error ? error.message : 'unknown_error',
      }));
      return json({ error: '服务暂时不可用，请稍后重试。' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
