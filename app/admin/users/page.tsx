import type { Metadata } from 'next';
import { UserManagement } from '@/components/user-management';

export const metadata: Metadata = {
  title: '用户管理',
  description: '管理时工的半导体实验室注册用户与账号权限。',
  robots: { index: false, follow: false },
};

export default function UserManagementRoute() {
  return <UserManagement />;
}
