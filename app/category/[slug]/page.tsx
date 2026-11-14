import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { herbal, getCategory } from '@/lib/catalog';
import { fetchLiveCatalog } from '@/lib/catalog/live';
import { pageMeta } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// See app/shop/page.tsx for why this is needed explicitly.
export const revalidate = 60;

// Seeds the build with the demo catalogue's category slugs; new paths
// (including a live store's own categories) still render on request
// thanks to the default `dynamicParams = true`.
export function generateStaticParams() {
  return herbal.cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const live = await fetchLiveCatalog();
  const category = live ? live.categories.find((c) => c.slug === slug) : getCategory(slug);

  if (!category) {
    return pageMeta('Category not found', 'That category is not in this store.', `/category/${slug}`);
  }

  return pageMeta(category.name, category.blurb, `/category/${slug}`);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const live = await fetchLiveCatalog();

  if (live) {
    const category = live.categories.find((c) => c.slug === slug) ?? null;
    return <CategoryView slug={slug} products={live.products} category={category} />;
  }

  // No store configured / backend unreachable — fall back to the demo catalogue.
  if (!getCategory(slug)) {
    notFound();
  }
  return <CategoryView slug={slug} />;
}
