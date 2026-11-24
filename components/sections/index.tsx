'use client';

import { OtBanner, OtFirstCategoryRail, OtHero, OtPerks, OtPromos, OtRail, OtReviews, OtRings, OtTrust } from '@/components/herbal/Home';
import { Fragment } from 'react';
import { useCatalog } from '@/lib/hooks';
import { herbal as demo } from '@/lib/catalog/config';

/** The honey home page, in the order stored with the catalogue. */
export function HomeSections() {
  const { template, product, category } = useCatalog();
  const resolve = (go: string) => {
    const [kind, slug] = go.split('/');
    if (kind === 'product') {
      const name = demo.products.find((item) => item.id === slug)?.name.toLowerCase();
      const item = product(slug) ?? template.products.find((item) => item.name.toLowerCase() === name);
      return item ? `product/${item.id}` : 'shop';
    }
    if (kind === 'category') {
      const name = demo.cats.find((item) => item.slug === slug)?.name.toLowerCase();
      const item = category(slug) ?? template.cats.find((item) => item.name.toLowerCase() === name);
      return item ? `category/${item.slug}` : 'shop';
    }
    return go;
  };
  return (
    <>
      {template.home.map((section, i) => {
        const key = `home-${i}`;
        switch (section.type) {
          case 'ootyHero':
            return <OtHero key={key} s={{ ...section, slides: section.slides.map((slide) => ({ ...slide, go: resolve(slide.go) })) }} i={i} />;
          case 'ootyTrust':
            return <OtTrust key={key} s={section} i={i} />;
          case 'ootyRings':
            return (
              <Fragment key={key}>
                <OtRings key={key} s={{ ...section, items: section.items.map((item) => ({ ...item, go: resolve(item.go) })) }} i={i} />
                {/* This store's own first category — works for any real
                    store, unlike the hardcoded-id rails below. */}
                <OtFirstCategoryRail key={`${key}-first-category`} />
              </Fragment>
            );
          case 'ootyBanner':
            return <OtBanner key={key} s={{ ...section, go: resolve(section.go) }} i={i} />;
          case 'ootyRail':
            return <OtRail key={key} s={section} i={i} />;
          case 'ootyPromos':
            return <OtPromos key={key} s={{ ...section, items: section.items.map((item) => ({ ...item, go: resolve(item.go) })) }} i={i} />;
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
