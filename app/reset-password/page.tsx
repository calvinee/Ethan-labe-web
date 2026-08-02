import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordResetPage } from '@/components/email-action-pages';

export const metadata: Metadata = {
  title: '重置密码',
  description: '重置时工的半导体实验室账号密码。',
  robots: { index: false, follow: false },
};

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<div className="account-loading">正在打开密码重置页…</div>}>
      <PasswordResetPage />
    </Suspense>
  );
}
