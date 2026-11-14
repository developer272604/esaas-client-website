"use client";
import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/lib/hooks';
import { ListView } from '@/components/ListView';
import { EmptyState } from '@/components/common/bits';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { clampQuery, shortQuery } from '@/lib/search';
import type { Category, Product } from '@/lib/types';

export function ShopView({ products: liveProducts }: { products?: Product[] }) {
  // `liveProducts` comes server-rendered from app/shop/page.tsx, so the
  // first HTML already has the right products (for SEO/no-JS). Once
  // hydrated, the reactive hook takes over (covers client navigations).
  const { products: hookProducts } = useCatalog();
  const products = liveProducts ?? hookProducts;
  useDocumentTitle('All products');
  return <ListView title="All products" blurb="Everything in the store." items={products} trail={[{ label: 'All products' }]} titleId="page.shop.title" blurbId="page.shop.blurb" activeSlug="all" />;
}

export function CategoryView({ slug, products: liveProducts, category: liveCategory }: { slug: string; products?: Product[]; category?: Category | null }) {
  const { category, products: hookProducts } = useCatalog();
  // Once a live catalog was fetched for this request, it's authoritative —
  // including a definitive "not found" (liveCategory === null) — don't fall
  // back to the demo catalogue's unrelated category of the same slug.
  const hasLive = liveProducts !== undefined;
  const products = hasLive ? liveProducts : hookProducts;
  const c = hasLive ? liveCategory ?? undefined : category(slug);
  useDocumentTitle(c ? c.name : 'Category not found');
  if (!c) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧭" title="Category not found" page text="That category does not exist in this store." action={{ label: 'Browse all products', href: '/shop' }} />
      </div>
    );
  }
  return <ListView key={slug} title={c.name} blurb={c.blurb} items={products.filter((p) => p.cat === slug)} trail={[{ label: c.name }]} titleId={`cat.${slug}.name`} blurbId={`cat.${slug}.blurb`} activeSlug={slug} />;
}

export function SearchView() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') ?? '';
  const { search } = useCatalog();
  const q = clampQuery(rawQuery);
  useDocumentTitle(`Search: ${shortQuery(q)}`);
  const results = search(q);
  return (
    <ListView
      key={q}
      title={`Results for “${shortQuery(q)}”`}
      blurb={results.length ? '' : 'Nothing matched. Try a shorter word or a different spelling.'}
      items={results}
      trail={[{ label: 'Search' }]}
      eyebrow="Search results"
      emptyText="Try a different search, or browse everything."
    />
  );
}
