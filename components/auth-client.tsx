'use client';

import { useCallback, useEffect, useState } from 'react';

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt: string | null;
};

type AuthResponse = {
  authenticated?: boolean;
  user?: PublicUser;
  error?: string;
  ok?: boolean;
};

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
  const data = await response.json() as AuthResponse & Record<string, unknown>;
  if (!response.ok) throw new Error(data.error || '请求失败，请稍后重试。');
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

export function AuthForm({
  onSuccess,
  initialMode = 'login',
}: {
  onSuccess?: (user: PublicUser) => void;
  initialMode?: 'login' | 'register';
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await apiRequest(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'register' ? { displayName } : {}),
        }),
      });
      if (!data.user) throw new Error('账号响应无效，请重新登录。');
      setPassword('');
      notifyAuthChanged();
      onSuccess?.(data.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '请求失败，请稍后重试。');
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
    setPassword('');
  };

  return (
    <div className="auth-form-shell">
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
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={busy} type="submit">
          {busy ? '处理中…' : mode === 'login' ? '登录实验室' : '创建账号'}
        </button>
        <p className="auth-privacy">
          登录状态使用安全会话 Cookie 保存；网站不会保存明文密码。
        </p>
      </form>
    </div>
  );
}
