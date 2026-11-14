'use client';

import { OtBanner, OtHero, OtPerks, OtPromos, OtRail, OtReviews, OtRings, OtTrust } from '@/components/herbal/Home';
import { herbal } from '@/lib/catalog';

/** The honey home page, in the order stored with the catalogue. */
export function HomeSections() {
  return (
    <>
      {herbal.home.map((section, i) => {
        const key = `home-${i}`;
        switch (section.type) {
          case 'ootyHero':
            return <OtHero key={key} s={section} i={i} />;
          case 'ootyTrust':
            return <OtTrust key={key} s={section} i={i} />;
          case 'ootyRings':
            return <OtRings key={key} s={section} i={i} />;
          case 'ootyBanner':
            return <OtBanner key={key} s={section} i={i} />;
          case 'ootyRail':
            return <OtRail key={key} s={section} i={i} />;
          case 'ootyPromos':
            return <OtPromos key={key} s={section} i={i} />;
          case 'ootyPerks':
            return <OtPerks key={key} s={section} i={i} />;
          case 'ootyReviews':
            return <OtReviews key={key} s={section} i={i} />;
          default:
            return null;
        }
      })}
    </>
  );
}
