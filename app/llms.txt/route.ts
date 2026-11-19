import { herbal } from '@/lib/catalog';
import { absoluteUrl, SITE } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * /llms.txt: a plain-text summary of the store for AI assistants (ChatGPT, Claude, Perplexity),
 * built from this build's catalogue so it always matches the site.
 */
export function GET() {
  const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const lines = [
    `# ${SITE}`,
    '',
    `> ${herbal.foot}`,
    '',
    `Online store at ${absoluteUrl('/')}. Prices are in Indian rupees and include the listed product only.`,
    '',
    '## Categories',
    ...herbal.cats.map((c) => `- [${c.name}](${absoluteUrl(`/category/${c.slug}`)})${c.blurb ? `: ${c.blurb}` : ''}`),
    '',
    '## Products',
    ...herbal.products.map((p) => {
      const summary = (p.short || p.desc || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      const stock = p.inStock === false ? ' (out of stock)' : '';
      return `- [${p.name}](${absoluteUrl(`/product/${p.id}`)}): ${inr(p.price)}${stock}${summary ? `. ${summary}` : ''}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
