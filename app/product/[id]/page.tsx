import type { Metadata } from 'next';
import { ProductView } from '@/components/views/ProductView';
import { herbal, getCategory, getProduct, isLiveCatalog } from '@/lib/catalog';
import { absoluteUrl, breadcrumbLd, jsonLd, pageMeta, SITE } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

// Generate static paths from this build's catalogue.
export function generateStaticParams() {
  return herbal.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return pageMeta('Product not found', `That product is not in the ${SITE} catalogue.`, `/product/${id}`, { noindex: true });
  }

  const description = product.short || product.desc;
  const image = product.images?.[0] || product.image;

  return pageMeta(product.seoTitle || product.name, description, `/product/${id}`, {
    image: image ? { url: image, alt: product.name } : undefined,
  });
}

/** Product + Offer data so search results can show price and availability. */
function productLd(id: string) {
  const product = getProduct(id);
  if (!product) return null;
  const images = (product.images?.length ? product.images : product.image ? [product.image] : []).map(absoluteUrl);
  const category = getCategory(product.cat);
  const url = absoluteUrl(`/product/${product.id}`);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.short || product.desc || undefined,
      image: images.length ? images : undefined,
      sku: product.sku,
      brand: { '@type': 'Brand', name: product.brand || SITE },
      category: category?.name,
      url,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'INR',
        price: product.price.toFixed(2),
        availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: SITE },
      },
      // Ratings are added only for a real store with real reviews. The demo catalogue's sample
      // ratings must never reach search engines: invented ratings break Google's rules.
      ...(isLiveCatalog && product.rev > 0 && product.rating > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.rev } }
        : {}),
    },
    breadcrumbLd([
      { name: 'Home', path: '/' },
      ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
      { name: product.name, path: `/product/${product.id}` },
    ]),
  ];
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const ld = productLd(id);

  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
      <ProductView id={id} />
    </>
  );
}
