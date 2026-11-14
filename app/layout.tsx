import type { CSSProperties, ReactNode } from 'react';
import { Manrope } from 'next/font/google';
import { Shell } from '@/components/Shell';
import { CatalogHydrator } from '@/components/common/CatalogHydrator';
import { herbal } from '@/lib/catalog';
import { fetchLiveCatalog } from '@/lib/catalog/live';
import { rootMetadata } from '@/lib/seo';
import { themeVars } from '@/lib/theme';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/common.css';
import '@/styles/sections.css';
import '@/styles/pages.css';
import '@/styles/category.css';
import '@/styles/cart.css';
import '@/styles/herbal.css';
import '@/styles/mobile.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

const theme = themeVars(
  { primary: herbal.theme.primary, font: herbal.theme.font, mode: herbal.theme.mode, radius: herbal.theme.radius },
  herbal.theme.bg,
);
theme['--font'] = 'var(--font-manrope), system-ui, sans-serif';

export const metadata = rootMetadata;

// See app/shop/page.tsx for why this is needed explicitly.
export const revalidate = 60;

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Fetched once per request (Next revalidates/caches this by itself, see
  // CATALOG_REVALIDATE_SECONDS); feeds the client-side catalog used by
  // cart/checkout/search. The actual product/category/shop pages also fetch
  // this themselves to render correct content on the server (see their
  // page.tsx) — Next dedupes identical fetches within the same request.
  const liveCatalog = await fetchLiveCatalog();

  return (
    <html lang="en" className={manrope.variable} data-theme="light" style={theme as CSSProperties}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <CatalogHydrator data={liveCatalog} />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
