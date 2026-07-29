import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, PackageCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ManagedEntry } from '@/lib/mdx-content';

const sectionLabels = {
  products: {
    name: '产品项目',
    back: '返回产品项目',
    nextHref: '/showcase',
    nextLabel: '查看代表项目',
  },
  learn: {
    name: '系统学习',
    back: '返回学习路线',
    nextHref: '/blog',
    nextLabel: '阅读工程文章',
  },
} as const;

export function ManagedContentPage({
  entry,
  Body,
}: {
  entry: ManagedEntry;
  Body: ComponentType;
}) {
  const labels = sectionLabels[entry.section];

  return (
    <div className={`managed-detail managed-detail-${entry.section}`}>
      <article>
        <header>
          <Link href={`/${entry.section}`} className="managed-detail-back">
            <ArrowLeft size={16} /> {labels.back}
          </Link>
          <p className="eyebrow">{entry.eyebrow}</p>
          <h1>{entry.title}</h1>
          <p className="managed-detail-deck">{entry.description}</p>
          <div className="managed-detail-meta">
            <span><CalendarDays size={15} /> {entry.displayDate}</span>
            <span><PackageCheck size={15} /> {entry.status}</span>
            {entry.price && <strong>{entry.price}</strong>}
          </div>
          <div className="card-tags">
            {entry.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </header>

        <div className="managed-detail-summary">
          <span>{labels.name}</span>
          <strong>{entry.meta}</strong>
        </div>

        <div className="article-prose mdx-article-body">
          <Body />
        </div>

        <footer>
          <Link href={`/${entry.section}`}><ArrowLeft size={16} /> {labels.back}</Link>
          <Link href={labels.nextHref}>{labels.nextLabel} <ArrowRight size={16} /></Link>
        </footer>
      </article>
    </div>
  );
}
