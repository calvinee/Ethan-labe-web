'use client';

import Link from 'next/link';
import { CheckCircle2, KeyRound, LoaderCircle, MailCheck, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiRequest, notifyAuthChanged } from './auth-client';

export function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const started = useRef(false);
  const [status, setStatus] = useState<'working' | 'success' | 'error'>('working');
  const [message, setMessage] = useState('正在验证邮箱…');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setStatus('error');
      setMessage('验证链接缺少令牌，请重新发送验证邮件。');
      return;
    }

    void apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        setStatus('success');
        setMessage(data.message || '邮箱验证成功。');
        notifyAuthChanged();
      })
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '邮箱验证失败。');
      });
  }, [token]);

  return (
    <div className="email-action-page">
      <section className={`email-action-card ${status}`}>
        <span className="email-action-icon">
          {status === 'working' && <LoaderCircle className="spin" size={28} />}
          {status === 'success' && <CheckCircle2 size={28} />}
          {status === 'error' && <ShieldAlert size={28} />}
        </span>
        <p>SHI LAB · EMAIL VERIFICATION</p>
        <h1>{status === 'success' ? '邮箱验证完成' : status === 'error' ? '无法验证邮箱' : '正在确认邮箱'}</h1>
        <strong>{message}</strong>
        <div className="email-action-links">
          {status === 'success' ? (
            <Link href="/account">进入账号中心</Link>
          ) : status === 'error' ? (
            <Link href="/account">返回登录并重发邮件</Link>
          ) : null}
          <Link className="secondary" href="/">返回首页</Link>
        </div>
      </section>
    </div>
  );
}

export function PasswordResetPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('重置链接缺少令牌，请重新申请。');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致。');
      return;
    }

    setBusy(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setComplete(true);
      setPassword('');
      setConfirmPassword('');
      notifyAuthChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '密码重置失败。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="email-action-page">
      <section className={`email-action-card reset ${complete ? 'success' : ''}`}>
        <span className="email-action-icon">
          {complete ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
        </span>
        <p>SHI LAB · PASSWORD RECOVERY</p>
        <h1>{complete ? '密码已重置' : '设置新的登录密码'}</h1>
        {complete ? (
          <>
            <strong>当前设备已经登录，其他设备的旧会话已全部退出。</strong>
            <div className="email-action-links">
              <Link href="/account">进入账号中心</Link>
              <Link className="secondary" href="/">返回首页</Link>
            </div>
          </>
        ) : (
          <form className="email-reset-form" onSubmit={submit}>
            <p><MailCheck size={16} /> 重置链接仅可使用一次，并将在 30 分钟后失效。</p>
            <label>
              <span>新密码</span>
              <input
                autoComplete="new-password"
                maxLength={128}
                minLength={10}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 10 位，包含字母和数字"
                required
                type="password"
                value={password}
              />
            </label>
            <label>
              <span>确认新密码</span>
              <input
                autoComplete="new-password"
                maxLength={128}
                minLength={10}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button disabled={busy} type="submit">
              {busy ? '正在重置…' : '确认重置密码'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
