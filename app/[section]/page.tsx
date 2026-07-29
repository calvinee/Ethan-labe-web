import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MagazineBlog } from '@/components/magazine-blog';
import { SectionView } from '@/components/section-view';
import { sectionContent } from '@/lib/content';
import { getBlogEntries, getManagedEntries, type ManagedSection } from '@/lib/mdx-content';

const publicSections = ['blog', 'showcase', 'products', 'learn'];

export function generateStaticParams() {
  return publicSections.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  if (!publicSections.includes(section)) return {};
  const content = sectionContent[section];
  if (!content) return {};
  return {
    title: content.title,
    description: content.description,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!publicSections.includes(section) || !sectionContent[section]) notFound();
  if (section === 'blog') return <MagazineBlog posts={getBlogEntries()} />;
  const managedCards = ['products', 'learn'].includes(section)
    ? getManagedEntries(section as ManagedSection)
    : undefined;
  return <SectionView slug={section} managedCards={managedCards} />;
}
