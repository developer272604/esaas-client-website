import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

/** A product path from the built sitemap, so the tests follow whatever catalogue this build has. */
function firstProductPath(): string {
  const sitemap = readFileSync(join(process.cwd(), 'out', 'sitemap.xml'), 'utf8');
  const match = sitemap.match(/<loc>https?:\/\/[^<]+?(\/product\/[^<]+)<\/loc>/);
  if (!match) throw new Error('No product URL in out/sitemap.xml');
  return match[1];
}

async function expectNoSidewaysScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page is wider than the screen, so it scrolls sideways').toBeLessThanOrEqual(clientWidth + 1);
}

async function expectNoBrokenImages(page: Page) {
  await page.waitForLoadState('load');
  const broken = await page.evaluate(() =>
    [...document.images].filter((img) => img.complete && img.naturalWidth === 0 && img.loading !== 'lazy').map((img) => img.currentSrc || img.src),
  );
  expect(broken, 'images that failed to load').toEqual([]);
}

test.describe('storefront', () => {
  test('home page loads without errors, broken images or sideways scroll', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expectNoBrokenImages(page);
    await expectNoSidewaysScroll(page);
    expect(errors, 'JavaScript errors on the home page').toEqual([]);
  });

  test('shop and category pages list products', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('main a[href^="/product/"]:visible').first()).toBeVisible();
    await expectNoSidewaysScroll(page);
  });

  test('product page has a title, price data for Google and a real canonical URL', async ({ page }) => {
    const path = firstProductPath();
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\//);
    expect(canonical).not.toContain('localhost');

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = blocks.flatMap((b) => [JSON.parse(b)].flat());
    const product = nodes.find((n) => n['@type'] === 'Product');
    expect(product, 'Product structured data').toBeTruthy();
    expect(product.offers.priceCurrency).toBe('INR');
    expect(Number(product.offers.price)).toBeGreaterThan(0);
    expect(nodes.some((n) => n['@type'] === 'BreadcrumbList')).toBe(true);
    await expectNoSidewaysScroll(page);
  });

  test('adding a product puts it in the cart', async ({ page }) => {
    await page.goto(firstProductPath());
    await page.getByRole('button', { name: 'Add to cart' }).first().click();
    await expect(page.getByRole('button', { name: /^Cart, 1 item/ })).toBeVisible();

    await page.goto('/cart');
    await expect(page.locator('main')).not.toContainText('Nothing in your cart');
  });

  test('checkout shows the delivery form when the cart has items', async ({ page }) => {
    await page.goto(firstProductPath());
    await page.getByRole('button', { name: 'Add to cart' }).first().click();
    await page.goto('/checkout');
    await expect(page.getByLabel(/Full name/i)).toBeVisible();
    await expect(page.getByLabel(/Mobile number/i)).toBeVisible();
    await expectNoSidewaysScroll(page);
  });

  test('search finds products', async ({ page }) => {
    await page.goto('/search?q=honey');
    await expect(page.locator('main a[href^="/product/"]:visible').first()).toBeVisible();
  });

  test('private pages tell search engines not to index them', async ({ page }) => {
    for (const path of ['/cart', '/checkout', '/orders', '/wishlist']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', /noindex/);
    }
  });

  test('unknown pages show the not-found page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
