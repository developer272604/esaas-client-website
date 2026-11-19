import type { MetadataRoute } from 'next';
import { herbal } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** Every page a shopper might search for: home, shop, each category and each product. */
export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();
  return [
    { url: absoluteUrl('/'), lastModified: built, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/shop'), lastModified: built, changeFrequency: 'weekly', priority: 0.8 },
    ...herbal.cats.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: built,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...herbal.products.map((p) => ({
      url: absoluteUrl(`/product/${p.id}`),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : built,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      images: (p.images?.length ? p.images : p.image ? [p.image] : []).map(absoluteUrl),
    })),
  ];
}
