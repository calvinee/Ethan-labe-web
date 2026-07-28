import type { Metadata } from 'next';
import { GuideArticle } from '@/components/guide-article';

export const metadata: Metadata = {
  title: '从 RTL 到可交付：FPGA 工程项目指南',
  description: '一份关于需求、架构、时序、CDC、验证和交付文档的 FPGA 工程实践指南。',
};

export default function GuidePage() {
  return <GuideArticle />;
}
