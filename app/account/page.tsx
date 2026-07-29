import type { Metadata } from 'next';
import { AccountPage } from '@/components/account-page';

export const metadata: Metadata = {
  title: '账号中心',
  description: '管理时工的半导体实验室邮箱账号与登录安全。',
};

export default function AccountRoute() {
  return <AccountPage />;
}
