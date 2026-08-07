import type { MetadataRoute } from 'next';
import {
  getBlogEntries,
  getLearningEntries,
  getMindMapEntries,
  getProductEntries,
} from '@/lib/mdx-content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://shi-fpga-lab.shi-fpga-lab.workers.dev';
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/blog',
    '/blog/notes',
    '/blog/archive',
    '/blog/about',
    '/mindmaps',
    '/showcase',
    '/products',
    '/learn',
    '/guide',
  ].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date('2026-07-29'),
      changeFrequency: path === '' || path === '/blog' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : path === '/guide' ? 0.7 : 0.8,
    }),
  );

  const articles = getBlogEntries().map((post) => ({
    url: `${base}${post.href}`,
    lastModified: new Date(`${post.date}T00:00:00+08:00`),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.8 : 0.7,
  }));

  const managed = [...getProductEntries(), ...getLearningEntries()].map((item) => ({
    url: `${base}${item.href}`,
    lastModified: new Date(`${item.date}T00:00:00+08:00`),
    changeFrequency: 'monthly' as const,
    priority: item.section === 'products' ? 0.8 : 0.7,
  }));

  const mindmaps = getMindMapEntries().map((item) => ({
    url: `${base}${item.href}`,
    lastModified: new Date(`${item.date}T00:00:00+08:00`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articles, ...managed, ...mindmaps];
}
