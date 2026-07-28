import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronDown, Clock3 } from 'lucide-react';
import { ArticleActions, ReadingProgress } from '@/components/article-interactions';
import { blogSource, getBlogEntries } from '@/lib/mdx-content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  const entry = getBlogEntries().find((post) => post.slug === slug);
  if (!page || !entry) notFound();

  const Mdx = page.data.body;
  const related = getBlogEntries()
    .filter((post) => post.slug !== slug)
    .slice(0, 3);

  return (
    <div className="magazine-article">
      <ReadingProgress />
      <article>
        <header className="magazine-article-header">
          <p className="magazine-category">{entry.category} · {entry.tags.join(' / ')}</p>
          <h1>{entry.title}</h1>
          <p className="magazine-article-deck">{entry.description}</p>

          <div className="magazine-author-row">
            <span className="magazine-avatar">时</span>
            <span>
              <strong>{entry.author}</strong>
              <small>{entry.displayDate} · <Clock3 size={12} /> {entry.reading}</small>
            </span>
          </div>

          <ArticleActions
            title={entry.title}
            likes={entry.likes}
            comments={entry.comments}
            saves={entry.saves}
          />
        </header>

        {page.data.toc.length > 0 && (
          <details className="magazine-toc">
            <summary><span>文章目录</span><ChevronDown size={18} /></summary>
            <nav>
              {page.data.toc.map((item) => (
                <a href={item.url} key={item.url}>{item.title}</a>
              ))}
            </nav>
          </details>
        )}

        <figure className={`magazine-article-hero article-visual-${entry.visual}`}>
          <div className="article-hero-grid" />
          <div className="article-hero-title">
            <span>{entry.category.toUpperCase()}</span>
            <strong>{entry.tags.slice(0, 3).join(' × ')}</strong>
          </div>
          <div className="flow-node flow-requirement"><span>01</span>问题定义</div>
          <div className="flow-node flow-rtl"><span>02</span>架构选择</div>
          <div className="flow-node flow-verify"><span>03</span>验证证据</div>
          <div className="flow-node flow-release"><span>04</span>工程交付</div>
          <i className="flow-line line-one" />
          <i className="flow-line line-two" />
          <i className="flow-line line-three" />
          <figcaption>SHI LAB · {entry.category} ENGINEERING NOTE</figcaption>
        </figure>

        <div className="article-prose mdx-article-body">
          <p className="article-update"><strong>内容版本：</strong>{entry.displayDate} · 由 MDX 内容库生成</p>
          <Mdx />
        </div>

        <section className="magazine-support">
          <p>本文来自时工的半导体实验室。</p>
          <p>所有工程文章都尽量公开关键判断、测量依据与可复现边界。</p>
          <Link href="/showcase">查看代表项目 <ArrowRight size={16} /></Link>
        </section>
      </article>

      <section className="magazine-related">
        <div>
          <strong>继续阅读</strong>
          <Link href="/blog">查看全部</Link>
        </div>
        <div className="magazine-related-grid">
          {related.map((post) => (
            <Link href={post.href} key={post.slug}>
              <small>{post.category}</small>
              <h3>{post.title}</h3>
              <span>{post.reading}</span>
            </Link>
          ))}
        </div>
      </section>

      <nav className="magazine-article-pager">
        <Link href="/blog"><ArrowLeft size={17} /> 返回工程杂志</Link>
        <Link href="/showcase">浏览代表项目 <ArrowRight size={17} /></Link>
      </nav>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return blogSource.getPages().map((page) => ({ slug: page.slugs[0] }));
}
