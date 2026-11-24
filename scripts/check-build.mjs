// Checks the static export in ./out after `next build`. Fails (exit 1) on SEO mistakes that
// would quietly hurt the live store: localhost URLs, missing sitemap/robots, product pages
// without a canonical or product data, and private pages that Google could index.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const out = join(process.cwd(), 'out');
const problems = [];
const fail = (msg) => problems.push(msg);

if (!existsSync(out)) {
  console.error('check-build: ./out is missing. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const html = walk(out).filter((f) => f.endsWith('.html'));
const rel = (f) => '/' + relative(out, f).replace(/\\/g, '/');

// 1. No localhost anywhere in the HTML (canonical, share images, structured data).
for (const f of html) {
  if (/https?:\/\/(localhost|127\.0\.0\.1)/.test(readFileSync(f, 'utf8'))) fail(`${rel(f)} contains a localhost URL`);
}

// 2. Crawler files exist and point at the real site.
for (const name of ['sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!existsSync(join(out, name))) fail(`${name} is missing`);
}
if (existsSync(join(out, 'robots.txt')) && !/Sitemap: https:\/\//.test(readFileSync(join(out, 'robots.txt'), 'utf8'))) {
  fail('robots.txt has no https Sitemap line');
}

// 3. Every product page has an https canonical and Product data with a price.
const productPages = html.filter((f) => rel(f).startsWith('/product/'));
if (productPages.length === 0) fail('no product pages were built');
for (const f of productPages) {
  const s = readFileSync(f, 'utf8');
  if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(s)) fail(`${rel(f)} has no https canonical`);
  if (!/"@type":"Product"/.test(s) || !/"priceCurrency":"INR"/.test(s)) fail(`${rel(f)} has no Product data with an INR price`);
}

// 4. One-shopper pages stay out of search results.
for (const page of ['cart', 'checkout', 'orders', 'success', 'wishlist', 'search']) {
  const f = [join(out, `${page}.html`), join(out, page, 'index.html')].find(existsSync);
  if (!f) continue;
  if (!/<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8'))) fail(`/${page} is missing noindex`);
}

if (problems.length) {
  console.error(`check-build: ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`check-build: OK (${html.length} pages, ${productPages.length} product pages).`);
