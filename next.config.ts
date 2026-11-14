import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // No `output: 'export'`: the site needs a running Node server (`next start`)
  // so product/category pages can fetch this store's catalog from the admin
  // backend on each request and revalidate on a timer (see
  // lib/catalog/live.ts and CATALOG_REVALIDATE_SECONDS) — a pure static
  // export can't do that, it would only ever show whatever was baked in at
  // build time.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    formats: ['image/avif', 'image/webp'],
    // No image-optimization server configured for product photos coming
    // from arbitrary admin-panel URLs (e.g. Unsplash) — skip Next's
    // optimizer rather than fail on unconfigured remote hosts.
    unoptimized: true,
  },
};

export default nextConfig;
