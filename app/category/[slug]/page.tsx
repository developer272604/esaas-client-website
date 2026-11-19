import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/views/ListViews';
import { herbal, getCategory } from '@/lib/catalog';
import { absoluteUrl, breadcrumbLd, jsonLd, pageMeta, SITE } from '@/lib/seo';

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
    return pageMeta('Category not found', 'That category is not in this store.', `/category/${slug}`, { noindex: true });
  }

  // Live categories may have no description yet; never send an empty meta description.
  return pageMeta(category.name, category.blurb || `Shop ${category.name} at ${SITE}. See prices, sizes and delivery details.`, `/category/${slug}`);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = herbal.products.filter((p) => p.cat === slug);
  const ld = [
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: category.name, path: `/category/${slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      url: absoluteUrl(`/category/${slug}`),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/product/${p.id}`), name: p.name })),
      },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <Suspense fallback={<div className="wrap page" aria-busy="true" />}>
        <CategoryView slug={slug} />
      </Suspense>
    </>
  );
}
