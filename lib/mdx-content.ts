import { blog, learning, mindmaps, products } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import type { ComponentType } from 'react';
import { navItems } from './content';

type TocItem = {
  title: string;
  url: string;
  depth: number;
};

type BaseDocData = {
  title: string;
  description: string;
  body: ComponentType;
  toc: TocItem[];
};

type BlogDocData = BaseDocData & {
  date: string;
  author: string;
  category: string;
  tags: string[];
  reading: string;
  visual: BlogEntry['visual'];
  featured: boolean;
  draft: boolean;
  likes: number;
  comments: number;
  saves: number;
};

type ManagedDocData = BaseDocData & {
  date: string;
  eyebrow: string;
  meta: string;
  status: string;
  price: string;
  tags: string[];
  icon: ManagedEntry['icon'];
  order: number;
  draft: boolean;
};

type MindMapDocData = BaseDocData & {
  date: string;
  category: string;
  accent: MindMapEntry['accent'];
  center: string;
  branches: MindMapBranch[];
  draft: boolean;
};

type TypedPage<T> = {
  slugs: string[];
  url: string;
  data: T;
};

type TypedSource<T> = {
  getPage(slugs: string[]): TypedPage<T> | undefined;
  getPages(): TypedPage<T>[];
};

export const blogSource = loader(toFumadocsSource(blog, []), {
  baseUrl: '/blog',
}) as unknown as TypedSource<BlogDocData>;

export const productsSource = loader(toFumadocsSource(products, []), {
  baseUrl: '/products',
}) as unknown as TypedSource<ManagedDocData>;

export const learningSource = loader(toFumadocsSource(learning, []), {
  baseUrl: '/learn',
}) as unknown as TypedSource<ManagedDocData>;

export const mindmapsSource = loader(toFumadocsSource(mindmaps, []), {
  baseUrl: '/mindmaps',
}) as unknown as TypedSource<MindMapDocData>;

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

export type ManagedSection = 'products' | 'learn';

export type MindMapBranch = {
  title: string;
  summary: string;
  children: string[];
};

export type MindMapEntry = {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  category: string;
  accent: 'blue' | 'cyan' | 'violet' | 'orange';
  center: string;
  branches: MindMapBranch[];
};

export type ManagedEntry = {
  slug: string;
  href: string;
  section: ManagedSection;
  title: string;
  description: string;
  date: string;
  displayDate: string;
  eyebrow: string;
  meta: string;
  status: string;
  price: string;
  tags: string[];
  icon:
    | 'cpu'
    | 'radio'
    | 'board'
    | 'layers'
    | 'code'
    | 'scan'
    | 'gauge'
    | 'rocket'
    | 'package'
    | 'boxes';
  order: number;
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

export function normalizeContentSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getBlogEntries(): BlogEntry[] {
  return blogSource
    .getPages()
    .filter((page) => !page.data.draft)
    .map((page) => ({
      slug: normalizeContentSlug(page.slugs[0]),
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

function normalizeManagedPages(
  section: ManagedSection,
  pages: Array<{
    slugs: string[];
    url: string;
    data: {
      title: string;
      description: string;
      date: string;
      eyebrow: string;
      meta: string;
      status: string;
      price: string;
      tags: string[];
      icon: ManagedEntry['icon'];
      order: number;
      draft: boolean;
    };
  }>,
): ManagedEntry[] {
  return pages
    .filter((page) => !page.data.draft)
    .map((page) => ({
      slug: page.slugs[0],
      href: page.url,
      section,
      title: page.data.title,
      description: page.data.description,
      date: page.data.date,
      displayDate: formatDate(page.data.date),
      eyebrow: page.data.eyebrow,
      meta: page.data.meta,
      status: page.data.status,
      price: page.data.price,
      tags: page.data.tags,
      icon: page.data.icon,
      order: page.data.order,
    }))
    .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));
}

export function getProductEntries(): ManagedEntry[] {
  return normalizeManagedPages('products', productsSource.getPages());
}

export function getLearningEntries(): ManagedEntry[] {
  return normalizeManagedPages('learn', learningSource.getPages());
}

export function getManagedEntries(section: ManagedSection): ManagedEntry[] {
  if (section === 'products') return getProductEntries();
  return getLearningEntries();
}

export function getMindMapEntries(): MindMapEntry[] {
  return mindmapsSource
    .getPages()
    .filter((page) => !page.data.draft)
    .map((page) => ({
      slug: normalizeContentSlug(page.slugs[0]),
      href: page.url,
      title: page.data.title,
      description: page.data.description,
      date: page.data.date,
      displayDate: formatDate(page.data.date),
      category: page.data.category,
      accent: page.data.accent,
      center: page.data.center,
      branches: page.data.branches ?? [],
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
    ...getProductEntries().map((item) => ({
      title: item.title,
      description: `${item.eyebrow} · ${item.description}`,
      href: item.href,
      group: '产品项目',
    })),
    ...getLearningEntries().map((item) => ({
      title: item.title,
      description: `${item.eyebrow} · ${item.description}`,
      href: item.href,
      group: '系统学习',
    })),
    ...getMindMapEntries().map((item) => ({
      title: item.title,
      description: `${item.category} · ${item.description}`,
      href: item.href,
      group: '思维导图',
    })),
  ];
}
