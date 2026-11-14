import type { Metadata } from 'next';
import { ProductView } from '@/components/views/ProductView';
import { herbal, getProduct } from '@/lib/catalog';
import { pageMeta, SITE } from '@/lib/seo';
import type { Product } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

// Generate static paths from hardcoded products
export function generateStaticParams() {
  return herbal.products.map((p) => ({ id: p.id }));
}

// Generate metadata for product page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  
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
  
  // Product data is handled by ProductView component which uses useCatalog hook
  return <ProductView id={id} />;
}
