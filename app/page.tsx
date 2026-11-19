import { HomeSections } from '@/components/sections';
import { herbal } from '@/lib/catalog';
import { absoluteUrl, jsonLd, SITE_URL } from '@/lib/seo';

// Who the shop is (OnlineStore) and how to search it (WebSite + SearchAction), with absolute URLs.
const ld = [
  {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${SITE_URL}/#store`,
    name: herbal.name,
    description: herbal.foot,
    url: SITE_URL,
    logo: absoluteUrl('/favicon.ico'),
    image: absoluteUrl('/images/hero-honey.webp'),
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Cash on Delivery',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: herbal.name,
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#store` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <HomeSections />
    </>
  );
}
