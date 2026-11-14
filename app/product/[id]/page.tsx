import type { Metadata } from 'next';
import { ProductView } from '@/components/views/ProductView';
import { getProduct as getStaticProduct, getProductById } from '@/lib/catalog';
import { getProduct, herbal } from '@/lib/catalog/config';
import { pageMeta, SITE } from '@/lib/seo';
import type { Product } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

// Generate static paths from both sources
export function generateStaticParams() {
  try {
    // Try to get from static JSON first
    const staticProducts = getStaticProduct() || [];
    if (staticProducts.length > 0) {
      return staticProducts.map((p: any) => ({ id: String(p.id) }));
    }
  } catch {
    // Fall back to hardcoded products
  }
  
  // Fallback to hardcoded products
  return herbal.products.map((p) => ({ id: p.id }));
}

// Adapt new product format to old format for metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  let product: Product | null = null;
  
  // Try static data first
  try {
    const staticProduct = getProductById(parseInt(id));
    if (staticProduct) {
      product = {
        id: String(staticProduct.id),
        name: staticProduct.name,
        cat: staticProduct.category?.slug || 'other',
        desc: staticProduct.description || '',
        short: staticProduct.seo_description || '',
        price: staticProduct.variants?.[0]?.price || 0,
        mrp: staticProduct.variants?.[0]?.mrp || 0,
        rating: 4.5,
        rev: Math.floor(Math.random() * 50) + 10,
        image: staticProduct.images?.[0]?.url || '/images/honey.webp',
        images: staticProduct.images?.map((img: any) => img.url) || [],
        opts: null,
        stock: staticProduct.variants?.[0]?.stock || 0,
        tags: staticProduct.tags || [],
        weight: staticProduct.weight_grams || 0,
        multi: null,
        d: staticProduct.seo_description || '',
      };
    }
  } catch {
    // Try hardcoded data
  }
  
  // Fallback to hardcoded
  if (!product) {
    product = getProduct(id);
  }
  
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
