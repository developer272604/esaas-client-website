import type { Metadata } from 'next';
import { herbal } from '@/lib/catalog';

export const SITE = herbal.name;
export const SITE_DESCRIPTION = herbal.foot;

export const rootMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${SITE} – Natural honey from the Nilgiris`,
    template: `%s – ${SITE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE,
  keywords: ['Ooty honey', 'Nilgiri honey', 'herbal products', 'Ooty varkey', 'natural wellness'],
  openGraph: {
    type: 'website',
    siteName: SITE,
    title: `${SITE} – Natural honey from the Nilgiris`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/images/hero-honey.webp', width: 1600, height: 900, alt: 'Jars of Nilgiri honey with honeycomb' }],
  },
  twitter: { card: 'summary_large_image', title: SITE, description: SITE_DESCRIPTION },
  icons: { icon: '/favicon.ico' },
};

export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} – ${SITE}`,
      description,
      url: path,
      images: [{ url: '/images/hero-honey.webp', alt: 'Ooty Herbals' }],
    },
  };
}
