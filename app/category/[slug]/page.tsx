import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { categories, getCategory } from '@/lib/catalog';
import { pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return pageMeta('Category not found', 'That category is not in this store.', `/category/${slug}`);
  return pageMeta(category.name, category.blurb, `/category/${slug}`);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!getCategory(slug)) notFound();
  return <CategoryView slug={slug} />;
}
