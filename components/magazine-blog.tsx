'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BlogEntry } from '@/lib/mdx-content';
import { BrandMark } from './brand-mark';
import { MagazineChannelNav } from './magazine-channel-nav';

const tabs = ['最新', '热门'] as const;
const INITIAL_ARCHIVE_COUNT = 3;

export function MagazineBlog({ posts }: { posts: BlogEntry[] }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('最新');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remainingPosts = posts.filter((post) => post.slug !== featured?.slug);
  const popularPosts = [...remainingPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  const visiblePosts = useMemo(() => {
    const sorted = activeTab === '热门'
      ? [...remainingPosts].sort((a, b) => b.likes - a.likes)
      : remainingPosts;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter((post) =>
      `${post.title}${post.description}${post.category}${post.tags.join(' ')}`
        .toLowerCase()
        .includes(query),
    );
  }, [activeTab, remainingPosts, searchQuery]);
  const displayedPosts = showAllPosts
    ? visiblePosts
    : visiblePosts.slice(0, INITIAL_ARCHIVE_COUNT);
  const hiddenPostCount = visiblePosts.length - displayedPosts.length;

  if (!featured) {
    return (
      <div className="magazine-page">
        <div className="magazine-empty">
          <BrandMark variant="journal" className="magazine-logo-mark" />
          <h1>工程杂志正在准备第一篇文章</h1>
          <p>在内容后台中新建文章并发布后，它会自动出现在这里。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="magazine-page">
      <MagazineChannelNav />

      <main className="magazine-feed">
        <article className="magazine-feature">
          <Link href={featured.href} className="magazine-feature-art" aria-label={featured.title}>
            {featured.coverImage ? (
              <Image
                src={featured.coverImage}
                alt={featured.coverAlt || featured.title}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 48vw"
                className="magazine-cover-image"
              />
            ) : (
              <>
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
              </>
            )}
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
                <PostVisual post={post} className="magazine-popular-art" />
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
                    onClick={() => {
                      setActiveTab(tab);
                      setShowAllPosts(false);
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className={`magazine-inline-search ${searchOpen ? 'open' : ''}`}>
                {searchOpen && (
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setShowAllPosts(true);
                    }}
                    placeholder="搜索文章…"
                    aria-label="搜索文章"
                  />
                )}
                <button
                  className="magazine-search"
                  aria-label={searchOpen ? '关闭搜索' : '搜索文章'}
                  onClick={() => {
                    if (searchOpen) setSearchQuery('');
                    setSearchOpen((value) => !value);
                  }}
                >
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>
            </div>

            <div className="magazine-post-list" id="magazine-post-list">
              {displayedPosts.map((post) => (
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
                  <PostVisual post={post} className="magazine-post-art" detailed />
                </article>
              ))}
              {displayedPosts.length === 0 && (
                <div className="magazine-no-results">
                  <strong>没有匹配的文章</strong>
                  <p>试试更短的关键词，例如“FPGA”“时序”或“AI”。</p>
                </div>
              )}
            </div>

            {hiddenPostCount > 0 && (
              <button
                type="button"
                className="magazine-see-all"
                aria-controls="magazine-post-list"
                aria-expanded={showAllPosts}
                onClick={() => setShowAllPosts(true)}
              >
                查看全部文章（还有 {hiddenPostCount} 篇） <ArrowRight size={16} />
              </button>
            )}
          </section>

          <aside className="magazine-sidebar">
            <div className="magazine-about">
              <BrandMark variant="journal" className="magazine-logo-mark" />
              <p className="magazine-category">ABOUT THE JOURNAL</p>
              <h2>时工工程杂志</h2>
              <p>面向 FPGA 与 AI 硬件工程师的独立技术刊物。记录真实项目、工程判断与可验证的交付方法。</p>
              <Link href="/blog/about">了解这本杂志 <ArrowRight size={14} /></Link>
            </div>
            <div className="magazine-side-links">
              <p className="magazine-category">探索更多</p>
              <Link href="/blog/notes">Notes <span>短笔记</span></Link>
              <Link href="/blog/archive">Archive <span>{String(posts.length).padStart(2, '0')}</span></Link>
              <Link href="/showcase">Showcase <span>项目</span></Link>
              <Link href="/products">产品与方案 <span>服务</span></Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PostVisual({
  post,
  className,
  detailed = false,
}: {
  post: BlogEntry;
  className: string;
  detailed?: boolean;
}) {
  return (
    <Link
      href={post.href}
      className={`${className} visual-${post.visual} ${post.coverImage ? 'has-cover' : ''}`}
      aria-label={`阅读：${post.title}`}
    >
      {post.coverImage ? (
        <Image
          src={post.coverImage}
          alt={post.coverAlt || post.title}
          fill
          sizes="(max-width: 760px) 38vw, 220px"
          className="magazine-cover-image"
        />
      ) : (
        <>
          <span className="post-art-grid" />
          {detailed && <strong>{post.category}</strong>}
          <i /><i />
          {detailed && <i />}
          {detailed && <em>{post.visual.toUpperCase()}</em>}
        </>
      )}
    </Link>
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
