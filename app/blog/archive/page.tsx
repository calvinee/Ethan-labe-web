import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MagazineChannelNav } from '@/components/magazine-channel-nav';
import { getBlogEntries, type BlogEntry } from '@/lib/mdx-content';

export const metadata: Metadata = {
  title: 'Archive｜时工工程杂志',
  description: '按主题浏览时工工程杂志的全部 FPGA、AI 硬件与市场观察文章。',
};

const groups: Array<{ id: string; title: string; description: string; match: (post: BlogEntry) => boolean }> = [
  {
    id: 'fpga',
    title: 'FPGA 实战',
    description: '从 RTL、时序、接口到板级验证与交付。',
    match: (post) => /FPGA|工程|调试|时序|交付/.test(`${post.category}${post.tags.join(' ')}`),
  },
  {
    id: 'ai',
    title: 'AI 硬件',
    description: '边缘 AI、算子加速、数据通路与系统效率。',
    match: (post) => /AI|加速|算子|模型/.test(`${post.category}${post.tags.join(' ')}`),
  },
  {
    id: 'market',
    title: '市场观察',
    description: '器件、供应链与半导体产品机会的长期判断。',
    match: (post) => /市场|观察|国产|供应链/.test(`${post.category}${post.tags.join(' ')}`),
  },
];

export default function BlogArchivePage() {
  const posts = getBlogEntries();

  return (
    <div className="magazine-page magazine-section-page">
      <MagazineChannelNav />
      <main className="magazine-archive-page">
        <header className="magazine-editorial-header">
          <p className="magazine-category">ALL WRITING / BY TOPIC</p>
          <h1>Archive</h1>
          <p>按工程问题浏览全部文章。每篇内容都来自真实项目、验证过程或长期市场观察。</p>
        </header>

        {groups.map((group) => {
          const items = posts.filter(group.match);
          if (items.length === 0) return null;
          return (
            <section className="magazine-archive-group" id={group.id} key={group.id}>
              <div className="magazine-archive-group-head">
                <div><h2>{group.title}</h2><p>{group.description}</p></div>
                <span>{String(items.length).padStart(2, '0')}</span>
              </div>
              <div>
                {items.map((post) => (
                  <Link href={post.href} key={`${group.id}-${post.slug}`}>
                    <time>{post.displayDate}</time>
                    <span><small>{post.category}</small><strong>{post.title}</strong></span>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="magazine-archive-group" id="all">
          <div className="magazine-archive-group-head">
            <div><h2>全部文章</h2><p>按发布日期从新到旧。</p></div>
            <span>{String(posts.length).padStart(2, '0')}</span>
          </div>
          <div>
            {posts.map((post) => (
              <Link href={post.href} key={`all-${post.slug}`}>
                <time>{post.displayDate}</time>
                <span><small>{post.category}</small><strong>{post.title}</strong></span>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
