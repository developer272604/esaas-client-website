import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    formats: ['image/avif', 'image/webp'],
    // `output: 'export'` ships pure static HTML with no Next.js server, so the
    // default Image Optimization API route (/_next/image) doesn't exist at
    // runtime. Without this, next/image renders srcset URLs that 404 once
    // deployed as static files.
    unoptimized: true,
  },
};

export default nextConfig;
