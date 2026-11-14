import type { CSSProperties, ReactNode } from 'react';
import { Manrope } from 'next/font/google';
import { Shell } from '@/components/Shell';
import { herbal } from '@/lib/catalog';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable} data-theme="light" style={theme as CSSProperties}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
