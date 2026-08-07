import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BrainCircuit } from 'lucide-react';
import { MagazineChannelNav } from '@/components/magazine-channel-nav';
import { MindMapCanvas } from '@/components/mindmap-canvas';
import { getMindMapEntries } from '@/lib/mdx-content';

export const metadata: Metadata = {
  title: '思维导图｜时工工程杂志',
  description: '把复杂工程问题压缩成可检查、可复用的决策结构。',
};

export default function MindMapsPage() {
  const mindMaps = getMindMapEntries();
  return (
    <div className="magazine-page magazine-section-page">
      <MagazineChannelNav />
      <main className="magazine-mindmaps-page">
        <header className="magazine-editorial-header magazine-mindmaps-page-head">
          <div><p className="magazine-category">MIND MAPS / ENGINEERING SYSTEMS</p><h1>思维导图</h1><p>把复杂工程问题压缩成可检查、可复用的决策结构。</p></div>
          <BrainCircuit size={32} />
        </header>
        <div className="magazine-mindmaps-grid">
          {mindMaps.map((mindMap) => (
            <Link href={mindMap.href} className={`mindmap-card mindmap-card-${mindMap.accent}`} key={mindMap.slug}>
              <div className="mindmap-card-meta"><span>{mindMap.category}</span><time>{mindMap.displayDate}</time></div>
              <MindMapCanvas entry={mindMap} />
              <div className="mindmap-card-copy"><h2>{mindMap.title}</h2><p>{mindMap.description}</p><span>展开导图 <ArrowUpRight size={15} /></span></div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
