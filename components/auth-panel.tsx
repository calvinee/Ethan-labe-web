'use client';

import Link from 'next/link';
import { LogOut, MailCheck, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest, AuthForm, notifyAuthChanged, useCurrentUser } from './auth-client';

export function AuthPanel() {
  const { user, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.classList.add('auth-modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('auth-modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const logout = async () => {
    setWorking(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      notifyAuthChanged();
      setOpen(false);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <button
        className={`account-trigger ${user ? 'signed-in' : ''}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="account-trigger-avatar">
          {user ? user.displayName.slice(0, 1).toUpperCase() : <UserRound size={15} />}
        </span>
        <span>{loading ? '账号' : user ? user.displayName : '登录 / 注册'}</span>
      </button>

      {open && createPortal(
        <div className="auth-modal" role="dialog" aria-modal="true" aria-label="实验室账号">
          <button className="auth-modal-backdrop" onClick={() => setOpen(false)} aria-label="关闭账号窗口" />
          <section className="auth-modal-card">
            <button className="auth-modal-close" onClick={() => setOpen(false)} aria-label="关闭">
              <X size={18} />
            </button>
            <header className="auth-modal-head">
              <span>SHI LAB · MEMBER SYSTEM</span>
              <h2>{user ? '欢迎回到实验室' : '进入工程师实验室'}</h2>
              <p>{user ? '管理账号与实验室权限。' : '用邮箱创建账号，保存你的实验室身份。'}</p>
            </header>

            {user ? (
              <div className="account-popover">
                <div className="account-identity">
                  <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{user.displayName}</strong>
                    <p>{user.email}</p>
                    {user.emailVerified && <small><MailCheck size={11} /> 邮箱已验证</small>}
                  </div>
                  <em>{user.role === 'admin' ? '管理员' : '成员'}</em>
                </div>
                <div className="account-actions">
                  <Link href="/account" onClick={() => setOpen(false)}>
                    <Settings size={17} /> 账号设置
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin/users" onClick={() => setOpen(false)}>
                      <ShieldCheck size={17} /> 用户管理
                    </Link>
                  )}
                  <button disabled={working} onClick={logout} type="button">
                    <LogOut size={17} /> {working ? '正在退出…' : '退出登录'}
                  </button>
                </div>
              </div>
            ) : (
              <AuthForm onSuccess={() => setOpen(false)} />
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
