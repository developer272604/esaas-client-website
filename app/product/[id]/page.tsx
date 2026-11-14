import type { Metadata } from 'next';
import { ProductView } from '@/components/views/ProductView';
import { herbal, getProduct } from '@/lib/catalog';
import { fetchLiveCatalog } from '@/lib/catalog/live';
import { pageMeta, SITE } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

// See app/shop/page.tsx for why this is needed explicitly.
export const revalidate = 60;

// Seeds the build with the demo catalogue's product ids; new paths
// (including a live store's own products) still render on request thanks
// to the default `dynamicParams = true`.
export function generateStaticParams() {
  return herbal.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const live = await fetchLiveCatalog();
  const product = live ? live.products.find((p) => p.id === id) : getProduct(id);

  if (!product) {
    return pageMeta('Product not found', 'That product is not in the Ooty Herbals catalogue.', `/product/${id}`);
  }

  const description = product.short || product.desc;
  const image = product.images?.[0] || product.image;

  return {
    ...pageMeta(product.name, description, `/product/${id}`),
    openGraph: {
      title: `${product.name} – ${SITE}`,
      description,
      url: `/product/${id}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const live = await fetchLiveCatalog();

  return <ProductView id={id} products={live?.products} />;
}
