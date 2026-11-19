import type { Metadata } from 'next';
import { herbal } from '@/lib/catalog';

export const SITE = herbal.name;
export const SITE_DESCRIPTION = herbal.foot;

/**
 * The storefront's public address, from NEXT_PUBLIC_SITE_URL (see .env.production).
 * Canonical tags, share images, the sitemap and structured data all build on it, so a
 * production build refuses to continue without a real https address.
 */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (!raw || /localhost|127\.0\.0\.1/.test(raw)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be set to the storefront's public https address for production builds " +
          `(got "${raw || 'nothing'}"). Without it every page tells Google its address is localhost.`,
      );
    }
    return 'http://localhost:3000';
  }
  return raw;
}

export const SITE_URL = resolveSiteUrl();

/** Absolute URL for a site path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return SITE_URL + (pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`);
}

const DEFAULT_IMAGE = { url: '/images/hero-honey.webp', width: 1600, height: 900, alt: 'Jars of Nilgiri honey with honeycomb' };

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE} – Natural honey from the Nilgiris`,
    template: `%s – ${SITE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE,
  keywords: ['Ooty honey', 'Nilgiri honey', 'herbal products', 'Ooty varkey', 'natural wellness'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE,
    locale: 'en_IN',
    url: '/',
    title: `${SITE} – Natural honey from the Nilgiris`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: SITE, description: SITE_DESCRIPTION },
  icons: { icon: '/favicon.ico' },
};

type PageMetaOptions = {
  /** Pages that only make sense for one shopper (cart, checkout, orders...) stay out of search results. */
  noindex?: boolean;
  image?: { url: string; alt: string };
};

export function pageMeta(title: string, description: string, path: string, options: PageMetaOptions = {}): Metadata {
  const image = options.image ?? { url: DEFAULT_IMAGE.url, alt: SITE };
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: options.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: SITE,
      locale: 'en_IN',
      title: `${title} – ${SITE}`,
      description,
      url: path,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: `${title} – ${SITE}`, description, images: [image.url] },
  };
}

/** Serialises JSON-LD safely for a <script> tag (a "</script>" inside a product name can't break out). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
