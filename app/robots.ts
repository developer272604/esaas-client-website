import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** Pages that belong to one shopper's session; they carry noindex too. */
const PRIVATE = ['/cart', '/checkout', '/orders', '/success', '/wishlist', '/search'];

/** AI search assistants, named explicitly so the policy is clear to them. */
const AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
