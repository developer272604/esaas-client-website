import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { herbal, categories, getCategory } from '@/lib/catalog';
import { pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Generate static paths from hardcoded categories
export function generateStaticParams() {
  return herbal.cats.map((c) => ({ slug: c.slug }));
}

// Generate metadata for category page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  
  if (!category) {
    return pageMeta('Category not found', 'That category is not in this store.', `/category/${slug}`);
  }
  
  return pageMeta(category.name, category.blurb, `/category/${slug}`);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  // Check if category exists
  if (!getCategory(slug)) {
    notFound();
  }
  
  return <CategoryView slug={slug} />;
}
