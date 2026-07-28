import { blog, notes } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { navItems } from './content';

export const blogSource = loader(toFumadocsSource(blog, []), {
  baseUrl: '/blog',
});

export const notesSource = loader(toFumadocsSource(notes, []), {
  baseUrl: '/notes',
});

export type BlogEntry = {
  slug: string;
  href: string;
  category: string;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  reading: string;
  author: string;
  tags: string[];
  likes: number;
  comments: number;
  saves: number;
  visual: 'timing' | 'fpga' | 'market' | 'board' | 'ai' | 'delivery';
  featured: boolean;
};

export type NoteEntry = {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  tag: string;
};

export type SearchItem = {
  title: string;
  description: string;
  href: string;
  group: string;
};

const formatDate = (value: string, compact = false) => {
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return value;
  if (compact) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

export function getBlogEntries(): BlogEntry[] {
  return blogSource
    .getPages()
    .filter((page) => !page.data.draft)
    .map((page) => ({
      slug: page.slugs[0],
      href: page.url,
      category: page.data.category,
      title: page.data.title,
      description: page.data.description,
      date: page.data.date,
      displayDate: formatDate(page.data.date),
      reading: page.data.reading,
      author: page.data.author,
      tags: page.data.tags,
      likes: page.data.likes,
      comments: page.data.comments,
      saves: page.data.saves,
      visual: page.data.visual,
      featured: page.data.featured,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNoteEntries(): NoteEntry[] {
  return notesSource
    .getPages()
    .filter((page) => !page.data.draft)
    .map((page) => ({
      slug: page.slugs[0],
      href: page.url,
      title: page.data.title,
      description: page.data.description,
      date: page.data.date,
      displayDate: formatDate(page.data.date, true),
      tag: page.data.tag,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getUnifiedSearchIndex(): SearchItem[] {
  return [
    { title: '首页', description: '时工的半导体实验室', href: '/', group: '导航' },
    ...navItems.map((item) => ({
      title: item.label,
      description: item.short,
      href: item.href,
      group: '栏目',
    })),
    ...getBlogEntries().map((post) => ({
      title: post.title,
      description: `${post.category} · ${post.description}`,
      href: post.href,
      group: '工程杂志',
    })),
    ...getNoteEntries().map((note) => ({
      title: note.title,
      description: `${note.tag} · ${note.description}`,
      href: note.href,
      group: '工程速记',
    })),
  ];
}
