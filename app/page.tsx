import { HomeSections } from '@/components/sections';
import { herbal } from '@/lib/catalog';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: herbal.name,
  description: herbal.foot,
  url: '/',
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeSections />
    </>
  );
}
