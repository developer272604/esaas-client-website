import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { herbal, getCategory } from '@/lib/catalog';
import { pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Generate static paths from this build's catalogue (the live store's
// categories if STORE_SLUG was set when `npm run import-products` ran
// before this build, otherwise the built-in demo catalogue).
export function generateStaticParams() {
  return herbal.cats.map((c) => ({ slug: c.slug }));
}

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

  if (!getCategory(slug)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="wrap page" aria-busy="true" />}>
      <CategoryView slug={slug} />
    </Suspense>
  );
}
