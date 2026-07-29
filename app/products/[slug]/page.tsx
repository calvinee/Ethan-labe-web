import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ManagedContentPage } from '@/components/managed-content-page';
import { getProductEntries, productsSource } from '@/lib/mdx-content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const page = productsSource.getPage([slug]);
  const entry = getProductEntries().find((item) => item.slug === slug);
  if (!page || !entry) notFound();
  const Body = page.data.body;
  return <ManagedContentPage entry={entry} Body={Body} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = productsSource.getPage([slug]);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}

export function generateStaticParams() {
  return productsSource.getPages().map((page) => ({ slug: page.slugs[0] }));
}
