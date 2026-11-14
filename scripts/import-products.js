/**
 * Import Products from the Admin Backend into a Static JSON File
 *
 * Each deployment of this website is tied to ONE store in the admin panel.
 * Set STORE_SLUG to that store's slug (Admin → Settings → Store profile) so
 * this script pulls only that store's products/categories from the public,
 * read-only storefront catalog endpoint — no admin login or token needed.
 *
 * Usage:
 *   STORE_SLUG=ooty-herbals npm run import-products
 *   STORE_SLUG=ooty-herbals API_URL=https://api.example.com npm run build
 *
 * Environment Variables:
 *   STORE_SLUG  - Required. The store's slug in the admin panel. Deploying a
 *                 second website for a different store? Point it at that
 *                 store's own slug and it gets only that store's catalog.
 *   API_URL     - Backend API base URL (default: http://localhost:8491)
 *   OUTPUT_PATH - Output file path (default: public/products.json)
 */

const fs = require('fs');
const path = require('path');

// This runs as a plain Node script (via `npm run prebuild`/`import-products`),
// not through Next.js, so .env.local isn't loaded automatically. Load it
// ourselves (without adding a dotenv dependency) so STORE_SLUG/API_URL set
// there are picked up, same as the rest of the Next.js app.
loadDotEnvLocal();

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8491').replace(/\/+$/, '');
const STORE_SLUG = process.env.STORE_SLUG || process.env.NEXT_PUBLIC_STORE_SLUG || '';
const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(__dirname, '../public/products.json');

const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function importProducts() {
  console.log('🚀 Starting product import...');
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Output: ${OUTPUT_PATH}`);

  if (!STORE_SLUG) {
    console.warn('\n⚠️  STORE_SLUG is not set — skipping import.');
    console.warn('   Each website build is tied to one store. Set it to that store\'s slug, e.g.:');
    console.warn('     STORE_SLUG=ooty-herbals npm run import-products');
    console.warn('   Keeping the existing public/products.json (the site falls back to its built-in demo catalogue).');
    return true; // Not a build failure: local/dev builds without a store configured still work.
  }

  console.log(`   Store: ${STORE_SLUG}`);

  const exportUrl = `${API_URL}/api/storefront/${encodeURIComponent(STORE_SLUG)}/catalog`;

  try {
    console.log(`\n📥 Fetching catalog from ${exportUrl} ...`);

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const body = await response.json();

    if (!body.data || !Array.isArray(body.data.products)) {
      throw new Error('Invalid response format: missing products data');
    }

    console.log(`   ✅ Fetched ${body.data.products.length} products`);
    console.log(`   ✅ Fetched ${body.data.categories.length} categories`);

    const exportData = {
      products: body.data.products,
      categories: body.data.categories,
      meta: {
        exported_at: body.meta?.exported_at || new Date().toISOString(),
        store_id: body.meta?.store_id ?? null,
        store_name: body.meta?.store_name ?? null,
        store_slug: body.meta?.store_slug ?? STORE_SLUG,
        product_count: body.data.products.length,
        category_count: body.data.categories.length,
      },
    };

    console.log('\n💾 Saving to file...');
    // This file is imported directly as a JSON module by lib/catalog/data.ts
    // (`import rawCatalog from '.../products.json'`), so it must be strict,
    // comment-free JSON — the bundler will fail the build otherwise.
    const jsonContent = JSON.stringify(exportData, null, 2) + '\n';

    fs.writeFileSync(OUTPUT_PATH, jsonContent, 'utf-8');

    console.log(`   Store: ${exportData.meta.store_name || STORE_SLUG} (${STORE_SLUG})`);
    console.log(`   Source: ${exportUrl}`);

    const fileSize = fs.statSync(OUTPUT_PATH).size;
    console.log(`   ✅ Saved to: ${OUTPUT_PATH} (${formatBytes(fileSize)})`);
    console.log('\n✨ Import completed successfully!');

    return true;
  } catch (error) {
    console.error('\n❌ Error during import:');
    console.error('   ' + error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if the backend is running: ' + API_URL);
    console.error(`   2. Check the store slug is correct and active: ${STORE_SLUG}`);
    console.error('   3. Try the endpoint directly in a browser:');
    console.error(`      ${exportUrl}`);
    return false;
  }
}

function loadDotEnvLocal() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] || '').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

importProducts().then((success) => {
  process.exit(success ? 0 : 1);
});
