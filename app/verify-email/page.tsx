import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EmailVerificationPage } from '@/components/email-action-pages';

export const metadata: Metadata = {
  title: '验证邮箱',
  description: '验证时工的半导体实验室账号邮箱。',
  robots: { index: false, follow: false },
};

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<div className="account-loading">正在打开验证链接…</div>}>
      <EmailVerificationPage />
    </Suspense>
  );
}
