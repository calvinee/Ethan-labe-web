import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Network } from 'lucide-react';
import type { ComponentType } from 'react';
import type { MindMapEntry } from '@/lib/mdx-content';
import { MindMapCanvas } from './mindmap-canvas';

export function MindMapDetail({
  entry,
  Body,
}: {
  entry: MindMapEntry;
  Body: ComponentType;
}) {
  return (
    <div className="mindmap-detail-page">
      <article>
        <header className="mindmap-detail-header">
          <Link href="/mindmaps"><ArrowLeft size={16} /> 返回思维导图</Link>
          <p className="magazine-category">MIND MAP · {entry.category}</p>
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
          <div>
            <span><CalendarDays size={15} /> {entry.displayDate}</span>
            <span><Network size={15} /> {entry.branches.length} 个主分支</span>
          </div>
        </header>

        <MindMapCanvas entry={entry} detailed />

        <section className="mindmap-branch-notes" aria-label="思维导图分支说明">
          {entry.branches.map((branch, index) => (
            <div key={branch.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{branch.title}</h2>
                <p>{branch.summary}</p>
                <ul>{branch.children.map((child) => <li key={child}>{child}</li>)}</ul>
              </div>
            </div>
          ))}
        </section>

        <div className="article-prose mdx-article-body mindmap-prose"><Body /></div>

        <footer className="mindmap-detail-footer">
          <Link href="/mindmaps"><ArrowLeft size={16} /> 返回导图索引</Link>
          <Link href="/learn">进入系统学习 <ArrowRight size={16} /></Link>
        </footer>
      </article>
    </div>
  );
}
