'use client';

import Link from 'next/link';
import { KeyRound, MailCheck, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  apiRequest,
  AuthForm,
  notifyAuthChanged,
  useCurrentUser,
} from './auth-client';

export function AccountPage() {
  const { user, loading } = useCurrentUser();
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  if (loading) {
    return <div className="account-page"><div className="account-loading">正在读取账号…</div></div>;
  }

  if (!user) {
    return (
      <div className="account-page">
        <section className="account-access-card">
          <div className="account-page-intro">
            <span><UserRound size={20} /> SHI LAB ACCOUNT</span>
            <h1>登录实验室账号</h1>
            <p>注册后可建立你的工程师身份；账号由安全 Cookie 保持登录状态。</p>
          </div>
          <AuthForm onSuccess={notifyAuthChanged} />
        </section>
      </div>
    );
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await apiRequest('/api/account/profile', {
        method: 'PATCH',
        body: JSON.stringify({ displayName }),
      });
      setMessage('昵称已更新。');
      notifyAuthChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '更新失败。');
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await apiRequest('/api/account/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, nextPassword }),
      });
      setCurrentPassword('');
      setNextPassword('');
      setMessage('密码已更新，其他设备的会话已经退出。');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '更新失败。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-page">
      <header className="account-page-header">
        <div>
          <span>MEMBER PROFILE / 工程师账号</span>
          <h1>{user.displayName}</h1>
          <p className="account-email-line">
            {user.email}
            <span className={user.emailVerified ? 'verified' : 'pending'}>
              <MailCheck size={13} />
              {user.emailVerified ? '邮箱已验证' : '邮箱待验证'}
            </span>
          </p>
        </div>
        <em>{user.role === 'admin' ? '管理员' : '实验室成员'}</em>
      </header>

      {(message || error) && (
        <p className={error ? 'account-message error' : 'account-message'} role="status">
          {error || message}
        </p>
      )}

      <div className="account-settings-grid">
        <form onSubmit={saveProfile}>
          <span className="account-setting-icon"><UserRound size={20} /></span>
          <h2>个人资料</h2>
          <p>昵称会显示在账号入口与未来的社区功能中。</p>
          <label>
            <span>工程师昵称</span>
            <input
              maxLength={40}
              minLength={2}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              value={displayName}
            />
          </label>
          <button disabled={busy} type="submit"><Save size={16} /> 保存资料</button>
        </form>

        <form onSubmit={savePassword}>
          <span className="account-setting-icon"><KeyRound size={20} /></span>
          <h2>登录安全</h2>
          <p>修改密码后会保留当前设备，并退出其他设备的会话。</p>
          <label>
            <span>当前密码</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label>
            <span>新密码</span>
            <input
              autoComplete="new-password"
              minLength={10}
              onChange={(event) => setNextPassword(event.target.value)}
              placeholder="至少 10 位，包含字母和数字"
              required
              type="password"
              value={nextPassword}
            />
          </label>
          <button disabled={busy} type="submit"><KeyRound size={16} /> 更新密码</button>
        </form>
      </div>

      {user.role === 'admin' && (
        <Link className="account-admin-link" href="/admin/users">
          <ShieldCheck size={18} />
          <span><strong>进入用户管理</strong><small>查看、停用账号或调整管理员权限</small></span>
        </Link>
      )}
    </div>
  );
}
