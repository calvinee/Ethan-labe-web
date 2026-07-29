import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock3, Terminal } from 'lucide-react';
import { getNoteEntries, notesSource } from '@/lib/mdx-content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const page = notesSource.getPage([slug]);
  const entry = getNoteEntries().find((note) => note.slug === slug);
  if (!page || !entry) notFound();
  const Mdx = page.data.body;

  return (
    <div className="engineering-note-page">
      <article>
        <header>
          <span className="engineering-note-icon"><Terminal size={22} /></span>
          <p className="magazine-category">QUICK NOTE · {entry.tag}</p>
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
          <div className="engineering-note-meta">
            <Clock3 size={14} />
            <span>{entry.displayDate}</span>
            <i />
            <span>MDX 内容库</span>
          </div>
        </header>
        <div className="article-prose mdx-article-body">
          <Mdx />
        </div>
        <footer>
          <Link href="/#quick-notes"><ArrowLeft size={16} /> 返回工程速记</Link>
          <Link href="/blog">阅读工程长文 <ArrowRight size={16} /></Link>
        </footer>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = notesSource.getPage([slug]);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return notesSource.getPages().map((page) => ({ slug: page.slugs[0] }));
}
