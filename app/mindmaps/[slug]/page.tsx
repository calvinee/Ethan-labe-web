import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MindMapDetail } from '@/components/mindmap-detail';
import {
  getMindMapEntries,
  mindmapsSource,
  normalizeContentSlug,
} from '@/lib/mdx-content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getMindMapPage(slug: string) {
  const normalizedSlug = normalizeContentSlug(slug);
  return mindmapsSource
    .getPages()
    .find((page) => normalizeContentSlug(page.slugs[0]) === normalizedSlug);
}

export default async function MindMapPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeContentSlug(slug);
  const page = getMindMapPage(normalizedSlug);
  const entry = getMindMapEntries().find((item) => item.slug === normalizedSlug);
  if (!page || !entry) notFound();

  const Body = page.data.body;
  return <MindMapDetail entry={entry} Body={Body} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getMindMapPage(slug);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return mindmapsSource.getPages().map((page) => ({
    slug: normalizeContentSlug(page.slugs[0]),
  }));
}
