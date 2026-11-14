import type { Metadata } from 'next';
import { ProductView } from '@/components/views/ProductView';
import { getProduct, herbal, products } from '@/lib/catalog';
import { pageMeta, SITE } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return pageMeta('Product not found', 'That product is not in the Ooty Herbals catalogue.', `/product/${id}`);
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
  const product = getProduct(id);
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.desc,
        image: product.images ?? (product.image ? [product.image] : []),
        sku: product.id,
        brand: { '@type': 'Brand', name: herbal.name },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.rev,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          availability: 'https://schema.org/InStock',
        },
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ProductView id={id} />
    </>
  );
}
