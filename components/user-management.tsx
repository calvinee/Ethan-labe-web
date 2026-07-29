'use client';

import Link from 'next/link';
import { MailCheck, RefreshCw, Search, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, AuthForm, notifyAuthChanged, useCurrentUser } from './auth-client';

type ManagedUser = {
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

export function UserManagement() {
  const { user, loading } = useCurrentUser();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Pick<ManagedUser, 'role' | 'status'>>>({});
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    setLoadingUsers(true);
    setError('');
    try {
      const data = await apiRequest('/api/admin/users');
      const nextUsers = (data.users ?? []) as ManagedUser[];
      setUsers(nextUsers);
      setDrafts(Object.fromEntries(nextUsers.map((item) => [
        item.id,
        { role: item.role, status: item.status },
      ])));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '无法读取用户。');
    } finally {
      setLoadingUsers(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((item) =>
      `${item.displayName}${item.email}`.toLowerCase().includes(normalized),
    );
  }, [query, users]);

  const saveUser = async (target: ManagedUser) => {
    const draft = drafts[target.id];
    if (!draft) return;
    setBusyId(target.id);
    setError('');
    try {
      await apiRequest(`/api/admin/users/${target.id}`, {
        method: 'PATCH',
        body: JSON.stringify(draft),
      });
      await loadUsers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '保存失败。');
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return <div className="user-admin-page"><div className="account-loading">正在验证管理员权限…</div></div>;
  }

  if (!user) {
    return (
      <div className="user-admin-page">
        <section className="admin-auth-gate">
          <ShieldCheck size={28} />
          <h1>用户管理需要登录</h1>
          <p>请使用管理员邮箱账号登录。</p>
          <AuthForm onSuccess={notifyAuthChanged} />
        </section>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="user-admin-page">
        <section className="admin-auth-gate compact">
          <ShieldAlert size={32} />
          <h1>当前账号没有管理权限</h1>
          <p>{user.email} 是普通成员账号。请联系站点管理员调整角色。</p>
          <Link href="/account">返回账号中心</Link>
        </section>
      </div>
    );
  }

  const activeCount = users.filter((item) => item.status === 'active').length;
  const adminCount = users.filter((item) => item.role === 'admin').length;
  const verifiedCount = users.filter((item) => item.emailVerified).length;

  return (
    <div className="user-admin-page">
      <header className="user-admin-header">
        <div>
          <span>SHI LAB · USER ADMINISTRATION</span>
          <h1>用户管理</h1>
          <p>查看注册用户、启停账号并控制管理员权限。</p>
        </div>
        <div className="user-admin-links">
          <Link href="/admin/">内容管理</Link>
          <Link href="/account">账号中心</Link>
        </div>
      </header>

      <section className="user-admin-stats">
        <div><Users size={19} /><strong>{users.length}</strong><span>注册用户</span></div>
        <div><MailCheck size={19} /><strong>{verifiedCount}</strong><span>邮箱已验证</span></div>
        <div><ShieldCheck size={19} /><strong>{activeCount}</strong><span>启用账号</span></div>
        <div><ShieldCheck size={19} /><strong>{adminCount}</strong><span>管理员</span></div>
      </section>

      <div className="user-admin-toolbar">
        <label>
          <Search size={17} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索昵称或邮箱"
            value={query}
          />
        </label>
        <button disabled={loadingUsers} onClick={() => void loadUsers()} type="button">
          <RefreshCw size={16} /> 刷新
        </button>
      </div>

      {error && <p className="account-message error" role="alert">{error}</p>}

      <div className="user-admin-table-wrap">
        <table className="user-admin-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>邮箱验证</th>
              <th>注册时间</th>
              <th>最近登录</th>
              <th>角色</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((item) => {
              const self = item.id === user.id;
              const draft = drafts[item.id] ?? { role: item.role, status: item.status };
              const changed = draft.role !== item.role || draft.status !== item.status;
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.displayName}{self ? '（当前账号）' : ''}</strong>
                    <span>{item.email}</span>
                  </td>
                  <td>
                    <span className={`user-verify-state ${item.emailVerified ? 'verified' : 'pending'}`}>
                      {item.emailVerified ? <MailCheck size={13} /> : null}
                      {item.emailVerified ? '已验证' : '待验证'}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString('zh-CN') : '尚未登录'}</td>
                  <td>
                    <select
                      disabled={self}
                      onChange={(event) => setDrafts((value) => ({
                        ...value,
                        [item.id]: { ...draft, role: event.target.value as ManagedUser['role'] },
                      }))}
                      value={draft.role}
                    >
                      <option value="member">普通成员</option>
                      <option value="admin">管理员</option>
                    </select>
                  </td>
                  <td>
                    <select
                      disabled={self}
                      onChange={(event) => setDrafts((value) => ({
                        ...value,
                        [item.id]: { ...draft, status: event.target.value as ManagedUser['status'] },
                      }))}
                      value={draft.status}
                    >
                      <option value="active">启用</option>
                      <option value="disabled">停用</option>
                    </select>
                  </td>
                  <td>
                    <button
                      disabled={self || !changed || busyId === item.id}
                      onClick={() => void saveUser(item)}
                      type="button"
                    >
                      {busyId === item.id ? '保存中…' : '保存'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loadingUsers && visibleUsers.length === 0 && <p className="user-admin-empty">没有匹配的用户。</p>}
      </div>
    </div>
  );
}
