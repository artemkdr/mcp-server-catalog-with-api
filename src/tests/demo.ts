#!/usr/bin/env bun

import { CatalogApiClient } from '../api-client.js';
import { Category, Product } from '../types.js';

async function demonstrateApi() {
    const client = new CatalogApiClient();

    console.log('🧪 Testing Catalog API Client\n');

    try {
        // Test health check
        console.log('1. Health Check:');
        const isHealthy = await client.healthCheck();
        console.log(`   API Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);

        if (!isHealthy) {
            console.log('❌ API server is not running. Please start it with: bun run api-server');
            return;
        }

        // Test product search
        console.log('2. Product Search (laptops):');
        const searchResult = await client.searchProducts({
            query: 'laptop',
            pageSize: 2,
        });
        console.log(`   Found ${searchResult.pagination?.total} products`);
        console.log(`   First product: ${(searchResult.data as Product[])[0]?.name}\n`);

        // Test categories
        console.log('3. Categories:');
        const categoriesResult = await client.getCategories();
        console.log(`   Found ${(categoriesResult.data as Category[]).length} categories`);
        console.log(`   First category: ${(categoriesResult.data as Category[])[0]?.name}\n`);

        // Test product details
        console.log('4. Product Details:');
        const productResult = await client.getProductDetails('iphone-15-pro');
        console.log(`   Product: ${(productResult.data as Product)?.name}`);
        console.log(`   Price: $${(productResult.data as Product)?.price}\n`);

        // Test recommendations
        console.log('5. Product Recommendations:');
        const recommendationsResult = await client.getProductRecommendations('iphone-15-pro', 2);
        console.log(`   Found ${(recommendationsResult.data as Product[]).length} recommendations`);
        if ((recommendationsResult.data as Product[]).length > 0) {
            console.log(`   First recommendation: ${(recommendationsResult.data as Product[])[0]?.name}\n`);
        }

        // Test availability
        console.log('6. Product Availability:');
        const availabilityResult = await client.checkProductAvailability('iphone-15-pro');
        const availability = availabilityResult.data as Product;
        console.log(`   In Stock: ${availability?.inStock ? '✅ Yes' : '❌ No'}`);
        console.log(`   Quantity: ${availability?.stockQuantity}\n`);

        console.log('✅ All API tests completed successfully!');
        console.log('\n🚀 Your catalog API system is working correctly!');
        console.log('   • API Server: http://localhost:3001');
        console.log('   • MCP Server: Ready for MCP clients');
    } catch (error) {
        console.error('❌ Error testing API:', error);
    }
}

if (import.meta.main) {
    demonstrateApi();
}
