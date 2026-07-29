'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BlogEntry } from '@/lib/mdx-content';

const tabs = ['最新', '热门', '讨论'] as const;

export function MagazineBlog({ posts }: { posts: BlogEntry[] }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('最新');
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remainingPosts = posts.filter((post) => post.slug !== featured?.slug);
  const popularPosts = [...remainingPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  const visiblePosts = useMemo(() => {
    if (activeTab === '热门') return [...remainingPosts].sort((a, b) => b.likes - a.likes);
    if (activeTab === '讨论') return [...remainingPosts].sort((a, b) => b.comments - a.comments);
    return remainingPosts;
  }, [activeTab, remainingPosts]);

  if (!featured) {
    return (
      <div className="magazine-page">
        <div className="magazine-empty">
          <span className="magazine-stamp">S</span>
          <h1>工程杂志正在准备第一篇文章</h1>
          <p>在内容后台中新建文章并发布后，它会自动出现在这里。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="magazine-page">
      <nav className="magazine-channel-nav" aria-label="博客分类">
        <Link className="active" href="/blog">首页</Link>
        <a href="#latest">FPGA 实战</a>
        <a href="#latest">AI 硬件</a>
        <a href="#latest">市场观察</a>
        <Link href="/showcase">项目档案</Link>
        <Link href={featured.href}>长文</Link>
      </nav>

      <main className="magazine-feed">
        <article className="magazine-feature">
          <Link href={featured.href} className="magazine-feature-art" aria-label={featured.title}>
            <div className="architecture-grid" />
            <div className="architecture-node node-input">ADC / MIPI</div>
            <div className="architecture-node node-buffer">DDR BUFFER</div>
            <div className="architecture-node node-engine">AI ENGINE</div>
            <div className="architecture-node node-output">RESULT</div>
            <div className="architecture-bridge bridge-a" />
            <div className="architecture-bridge bridge-b" />
            <div className="architecture-bridge bridge-c" />
            <div className="feature-art-title">
              <span>ENGINEERING DEEP DIVE · 01</span>
              <strong>FPGA × AI</strong>
              <em>从架构到交付的完整路径</em>
            </div>
            <div className="architecture-scan" />
          </Link>

          <div className="magazine-feature-copy">
            <p className="magazine-category">{featured.category}</p>
            <Link href={featured.href}><h1>{featured.title}</h1></Link>
            <p>{featured.description}</p>
            <div className="magazine-byline">
              <span className="magazine-avatar">时</span>
              <span>
                <strong>{featured.author}</strong>
                <small>{featured.displayDate} · {featured.reading}</small>
              </span>
            </div>
            <Engagement post={featured} />
          </div>
        </article>

        <section className="magazine-popular">
          <div className="magazine-popular-head">
            <h2>最受欢迎</h2>
            <a href="#latest">查看全部</a>
          </div>
          <div className="magazine-popular-grid">
            {popularPosts.map((post) => (
              <article key={post.slug}>
                <div>
                  <Link href={post.href}><h3>{post.title}</h3></Link>
                  <div className="magazine-post-meta">
                    <span>{post.displayDate}</span><i>·</i><span>{post.author}</span>
                  </div>
                  <Engagement post={post} compact />
                </div>
                <Link
                  href={post.href}
                  className={`magazine-popular-art visual-${post.visual}`}
                  aria-label={`阅读：${post.title}`}
                >
                  <span className="post-art-grid" />
                  <i /><i />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="magazine-lower-grid">
          <section className="magazine-archive" id="latest">
            <div className="magazine-tabs">
              <div role="tablist" aria-label="文章排序">
                {tabs.map((tab) => (
                  <button
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={activeTab === tab ? 'active' : undefined}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="magazine-search" aria-label="搜索文章">
                <Search size={20} />
              </button>
            </div>

            <div className="magazine-post-list">
              {visiblePosts.map((post) => (
                <article className="magazine-post" key={post.slug}>
                  <div className="magazine-post-copy">
                    <p className="magazine-category">{post.category}</p>
                    <Link href={post.href}><h2>{post.title}</h2></Link>
                    <p>{post.description}</p>
                    <div className="magazine-post-meta">
                      <span>{post.displayDate}</span>
                      <i>·</i>
                      <span>{post.author}</span>
                      <i>·</i>
                      <span>{post.reading}</span>
                    </div>
                    <Engagement post={post} compact />
                  </div>
                  <Link
                    href={post.href}
                    className={`magazine-post-art visual-${post.visual}`}
                    aria-label={`阅读：${post.title}`}
                  >
                    <span className="post-art-grid" />
                    <strong>{post.category}</strong>
                    <i />
                    <i />
                    <i />
                    <em>{post.visual.toUpperCase()}</em>
                  </Link>
                </article>
              ))}
            </div>

            <button className="magazine-see-all">查看全部文章 <ArrowRight size={16} /></button>
          </section>

          <aside className="magazine-sidebar">
            <div className="magazine-about">
              <span className="magazine-stamp">S</span>
              <p className="magazine-category">ABOUT THE JOURNAL</p>
              <h2>时工工程杂志</h2>
              <p>面向 FPGA 与 AI 硬件工程师的独立技术刊物。记录真实项目、工程判断与可验证的交付方法。</p>
              <Link href="/">关于实验室 <ArrowRight size={14} /></Link>
            </div>
            <div className="magazine-side-links">
              <p className="magazine-category">探索更多</p>
              <Link href="/showcase">项目档案 <span>11</span></Link>
              <Link href="/products">IP 与硬件产品 <span>12</span></Link>
              <Link href="/learn">系统学习路线 <span>05</span></Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Engagement({ post, compact = false }: { post: BlogEntry; compact?: boolean }) {
  return (
    <div className={`magazine-engagement ${compact ? 'compact' : ''}`} aria-label="文章互动数据">
      <span><Heart size={compact ? 14 : 17} /> {post.likes}</span>
      <span><MessageCircle size={compact ? 14 : 17} /> {post.comments}</span>
      <span><Repeat2 size={compact ? 14 : 17} /> {post.saves}</span>
      <span className="engagement-save"><Bookmark size={compact ? 14 : 17} /></span>
    </div>
  );
}
