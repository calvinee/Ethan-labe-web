import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteShell } from '@/components/site-shell';
import { getUnifiedSearchIndex } from '@/lib/mdx-content';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://shi-fpga-lab.shi-fpga-lab.workers.dev'),
  title: {
    default: '时工的半导体实验室｜FPGA、AI 硬件与工程产品',
    template: '%s｜时工的半导体实验室',
  },
  description:
    '面向 FPGA 与 AI 硬件工程师的个人实验室：分享工程作品、技术思想与市场分析，提供 IP 核、PCB、AI 硬件和方案设计。',
  keywords: ['FPGA', 'Xilinx', '安路', 'Verilog', 'IP核', 'PCB', '边缘AI', '半导体'],
  openGraph: {
    title: '时工的半导体实验室',
    description: '把工程问题做成作品、文章与产品。',
    type: 'website',
    locale: 'zh_CN',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: '时工工程杂志：FPGA、AI 硬件与工程交付',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '时工的半导体实验室',
    description: '把工程问题做成作品、文章与产品。',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const searchItems = getUnifiedSearchIndex();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <SiteShell searchItems={searchItems}>{children}</SiteShell>
      </body>
    </html>
  );
}
