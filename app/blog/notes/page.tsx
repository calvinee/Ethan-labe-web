import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Pin } from 'lucide-react';
import { MagazineChannelNav } from '@/components/magazine-channel-nav';
import { blogSettings } from '@/lib/blog-settings';
import { blogNotesSource, normalizeContentSlug } from '@/lib/mdx-content';

export const metadata: Metadata = {
  title: 'Notes｜时工工程杂志',
  description: blogSettings.notesDescription,
};

export default function BlogNotesPage() {
  const notes = blogNotesSource
    .getPages()
    .filter((page) => !page.data.draft)
    .sort((a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.date.localeCompare(a.data.date));

  return (
    <div className="magazine-page magazine-section-page">
      <MagazineChannelNav />
      <main className="magazine-notes-page">
        <header className="magazine-editorial-header">
          <p className="magazine-category">SHORT FORM / WORK IN PROGRESS</p>
          <h1>{blogSettings.notesTitle}</h1>
          <p>{blogSettings.notesDescription}</p>
        </header>

        <div className="magazine-notes-feed">
          {notes.map((note) => {
            const Body = note.data.body;
            const slug = normalizeContentSlug(note.slugs[0]);
            return (
              <article id={slug} key={slug} className="magazine-note-card">
                <div className="magazine-note-meta">
                  <span>{note.data.category}</span>
                  <time>{note.data.date}</time>
                  {note.data.pinned && <span className="magazine-note-pin"><Pin size={13} /> 置顶</span>}
                </div>
                <h2>{note.data.title}</h2>
                <p className="magazine-note-deck">{note.data.description}</p>
                {note.data.image && (
                  <div className="magazine-note-image">
                    <Image src={note.data.image} alt={note.data.title} fill sizes="(max-width: 760px) 100vw, 700px" />
                  </div>
                )}
                <div className="magazine-note-body article-prose"><Body /></div>
                <footer>
                  <div>{note.data.tags?.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                  {note.data.linkUrl && (
                    <Link href={note.data.linkUrl} target="_blank" rel="noreferrer">
                      {note.data.linkLabel || '查看相关链接'} <ArrowUpRight size={14} />
                    </Link>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
