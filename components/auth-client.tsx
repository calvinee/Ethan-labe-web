'use client';

import { ArrowLeft, MailCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
};

type AuthResponse = {
  authenticated?: boolean;
  user?: PublicUser;
  error?: string;
  code?: string;
  email?: string;
  message?: string;
  ok?: boolean;
  requiresVerification?: boolean;
};

export class ApiError extends Error {
  code?: string;
  email?: string;

  constructor(message: string, data?: AuthResponse) {
    super(message);
    this.name = 'ApiError';
    this.code = data?.code;
    this.email = data?.email;
  }
}

export async function apiRequest(
  path: string,
  init?: RequestInit,
): Promise<AuthResponse & Record<string, unknown>> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  let data: AuthResponse & Record<string, unknown>;
  try {
    data = await response.json() as AuthResponse & Record<string, unknown>;
  } catch {
    throw new ApiError('服务响应无效，请稍后重试。');
  }
  if (!response.ok) throw new ApiError(data.error || '请求失败，请稍后重试。', data);
  return data;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event('shi-lab-auth-changed'));
}

export function useCurrentUser() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest('/api/auth/me');
      setUser(data.authenticated && data.user ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const handleChange = () => void refresh();
    window.addEventListener('shi-lab-auth-changed', handleChange);
    return () => window.removeEventListener('shi-lab-auth-changed', handleChange);
  }, [refresh]);

  return { user, loading, refresh };
}

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthForm({
  onSuccess,
  initialMode = 'login',
}: {
  onSuccess?: (user: PublicUser) => void;
  initialMode?: 'login' | 'register';
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'forgot') {
        const data = await apiRequest('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        setMessage(data.message || '如果该邮箱已注册，密码重置邮件将在几分钟内送达。');
        return;
      }

      const data = await apiRequest(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'register' ? { displayName } : {}),
        }),
      });
      setPassword('');

      if (mode === 'register') {
        setPendingVerificationEmail(data.email || email);
        setMessage(data.message || '验证邮件已发送，请检查收件箱。');
        return;
      }
      if (!data.user) throw new ApiError('账号响应无效，请重新登录。');
      notifyAuthChanged();
      onSuccess?.(data.user);
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        (requestError.code === 'EMAIL_NOT_VERIFIED' || requestError.code === 'EMAIL_DELIVERY_FAILED')
      ) {
        setPendingVerificationEmail(requestError.email || email);
      }
      setError(requestError instanceof Error ? requestError.message : '请求失败，请稍后重试。');
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
      });
      setMessage(data.message || '新的验证邮件已经发送。');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '验证邮件发送失败。');
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPendingVerificationEmail('');
    setPassword('');
  };

  return (
    <div className="auth-form-shell">
      {mode === 'forgot' ? (
        <button className="auth-back-button" onClick={() => changeMode('login')} type="button">
          <ArrowLeft size={15} /> 返回邮箱登录
        </button>
      ) : (
        <div className="auth-tabs" role="tablist" aria-label="账号入口">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'active' : undefined}
            onClick={() => changeMode('login')}
          >
            邮箱登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'active' : undefined}
            onClick={() => changeMode('register')}
          >
            注册账号
          </button>
        </div>
      )}

      {mode === 'forgot' && (
        <div className="auth-flow-intro">
          <MailCheck size={20} />
          <div>
            <strong>找回密码</strong>
            <p>输入注册邮箱，我们会发送 30 分钟有效的重置链接。</p>
          </div>
        </div>
      )}

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && (
          <label>
            <span>工程师昵称</span>
            <input
              autoComplete="nickname"
              maxLength={40}
              minLength={2}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如：时工"
              required
              value={displayName}
            />
          </label>
        )}
        <label>
          <span>邮箱地址</span>
          <input
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        {mode !== 'forgot' && (
          <label>
            <span>密码</span>
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              maxLength={128}
              minLength={10}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'login' ? '输入密码' : '至少 10 位，包含字母和数字'}
              required
              type="password"
              value={password}
            />
          </label>
        )}
        {mode === 'login' && (
          <button className="auth-link-button" onClick={() => changeMode('forgot')} type="button">
            忘记密码？
          </button>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        {pendingVerificationEmail && (
          <button
            className="auth-resend-button"
            disabled={busy}
            onClick={() => void resendVerification()}
            type="button"
          >
            <MailCheck size={15} /> 重发验证邮件
          </button>
        )}
        <button className="auth-submit" disabled={busy} type="submit">
          {busy
            ? '处理中…'
            : mode === 'login'
              ? '登录实验室'
              : mode === 'register'
                ? '创建账号并验证邮箱'
                : '发送重置邮件'}
        </button>
        <p className="auth-privacy">
          密码不会以明文保存；验证与重置链接均为一次性链接。
        </p>
      </form>
    </div>
  );
}
