'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import NextLink from 'next/link';
import { needsDocumentNavigation } from '@/lib/catalog';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

/** Keeps the `href` prop the storefront components already use. */
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, children, ...rest }, ref) {
  if (needsDocumentNavigation(href)) return <a ref={ref} href={href} {...rest}>{children}</a>;
  return (
    <NextLink ref={ref} href={href} {...rest}>
      {children}
    </NextLink>
  );
});

export default Link;
