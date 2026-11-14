/**
 * Import Products from Backend API to JSON File
 * 
 * This script fetches products and categories from the Laravel backend API
 * and saves them as a JSON file in the public directory for static site generation.
 * 
 * Usage:
 *   node scripts/import-products.js
 * 
 * Environment Variables:
 *   API_URL - Backend API URL (default: http://localhost:8000)
 *   API_TOKEN - Admin token for authentication (optional for public endpoints)
 *   OUTPUT_PATH - Output file path (default: public/products.json)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TOKEN = process.env.API_TOKEN || process.env.ADMIN_TOKEN;
const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(__dirname, '../public/products.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function importProducts() {
    console.log('🚀 Starting product import...');
    console.log(`   API URL: ${API_URL}`);
    console.log(`   Output: ${OUTPUT_PATH}`);

    try {
        // Build headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        if (API_TOKEN) {
            headers['Authorization'] = `Bearer ${API_TOKEN}`;
        }

        console.log('\n📥 Fetching products from backend...');
        
        // Try to fetch with store ID if available, otherwise use default
        const storeId = process.env.STORE_ID;
        const exportUrl = storeId 
            ? `${API_URL}/api/products/export?store_id=${storeId}`
            : `${API_URL}/api/products/export`;

        const response = await fetch(exportUrl, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.products) {
            throw new Error('Invalid response format: missing products data');
        }

        console.log(`   ✅ Fetched ${data.data.products.length} products`);
        console.log(`   ✅ Fetched ${data.data.categories.length} categories`);

        // Prepare final data structure
        const exportData = {
            products: data.data.products,
            categories: data.data.categories,
            meta: {
                exported_at: data.meta?.exported_at || new Date().toISOString(),
                store_id: data.meta?.store_id,
                store_name: data.meta?.store_name,
                product_count: data.data.products.length,
                category_count: data.data.categories.length,
            },
        };

        // Save to file
        console.log('\n💾 Saving to file...');
        const jsonContent = JSON.stringify(exportData, null, 2);
        fs.writeFileSync(OUTPUT_PATH, jsonContent, 'utf-8');

        const fileSize = fs.statSync(OUTPUT_PATH).size;
        console.log(`   ✅ Saved to: ${OUTPUT_PATH}`);
        console.log(`   ✅ File size: ${formatBytes(fileSize)}`);

        // Add metadata comment at the top of the file
        const fileContent = `/**
 * Static Products Data for Esaas Website
 * Generated from backend API: ${API_URL}
 * Exported at: ${exportData.meta.exported_at}
 * Products: ${exportData.meta.product_count} | Categories: ${exportData.meta.category_count}
 * 
 * This file is used for static site generation (SSG)
 * Update this file when products change in admin panel
 * Then rebuild the website: npm run build
 */

` + jsonContent;

        fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8');

        console.log('\n✨ Import completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify the JSON file: cat ' + OUTPUT_PATH);
        console.log('   2. Rebuild your website: npm run build');
        console.log('   3. Deploy the updated website');

        return true;
    } catch (error) {
        console.error('\n❌ Error during import:');
        console.error('   ' + error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if backend is running: ' + API_URL);
        console.error('   2. Check if API_TOKEN is valid (if required)');
        console.error('   3. Try accessing the export endpoint manually in browser:');
        console.error('      ' + API_URL + '/api/products/export');
        return false;
    }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the import
importProducts().then(success => {
    process.exit(success ? 0 : 1);
});
