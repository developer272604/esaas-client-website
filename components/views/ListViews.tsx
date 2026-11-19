"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useCatalog } from '@/lib/hooks';
import { ListView } from '@/components/ListView';
import { EmptyState } from '@/components/common/bits';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { clampQuery, shortQuery } from '@/lib/search';

export function ShopView() {
  const { products } = useCatalog();
  useDocumentTitle('All products');
  return <ListView title="All products" blurb="Everything in the store." items={products} trail={[{ label: 'All products' }]} titleId="page.shop.title" blurbId="page.shop.blurb" activeSlug="all" />;
}

export function CategoryView({ slug }: { slug: string }) {
  const { category, products } = useCatalog();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subcat = searchParams.get('subcat') || undefined;
  const c = category(slug);
  useDocumentTitle(c ? c.name : 'Category not found');
  if (!c) {
    return (
      <div className="wrap page">
        <EmptyState emoji="🧭" title="Category not found" page text="That category does not exist in this store." action={{ label: 'Browse all products', href: '/shop' }} />
      </div>
    );
  }
  const allInCat = products.filter((p) => p.cat === slug);
  const items = subcat ? allInCat.filter((p) => p.subcat === subcat) : allInCat;
  const subObj = c.subcategories?.find((s) => s.slug === subcat);

  const trail = [
    { label: c.name, ...(subcat ? { href: `/category/${c.slug}` } : {}) },
    ...(subObj ? [{ label: subObj.name }] : []),
  ];

  return (
    <ListView
      key={`${slug}-${subcat ?? 'all'}`}
      title={subObj ? `${c.name} · ${subObj.name}` : c.name}
      blurb={c.blurb}
      items={items}
      trail={trail}
      titleId={`cat.${slug}.name`}
      blurbId={`cat.${slug}.blurb`}
      activeSlug={slug}
      activeSubcat={subcat}
      onClearSubcat={() => router.push(`/category/${slug}`)}
    />
  );
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
