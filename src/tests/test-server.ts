#!/usr/bin/env bun

/**
 * Simple test script to demonstrate the MCP Catalog API Server
 * This script shows how to interact with the server programmatically
 */

import { spawn } from 'bun';

async function testMCPServer() {
  console.log('🚀 Testing MCP Catalog API Server...\n');

  // Start the MCP server
  const serverProcess = spawn(['bun', 'run', 'index.ts'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: process.cwd(),
  });

  // Test data - simulating MCP client requests
  const testRequests = [
    {
      name: 'List Tools',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      },
    },
    {
      name: 'Search Products - Apple',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'search_products',
          arguments: {
            query: 'apple',
            inStockOnly: true,
          },
        },
      },
    },
    {
      name: 'Get Product Details',
      request: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_product_details',
          arguments: {
            productId: 'iphone-15-pro',
          },
        },
      },
    },
    {
      name: 'Get Categories',
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_categories',
          arguments: {
            includeProductCount: true,
          },
        },
      },
    },
    {
      name: 'Check Availability',
      request: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'check_product_availability',
          arguments: {
            productId: 'macbook-pro-m3',
          },
        },
      },
    },
  ];

  // Send test requests
  for (const test of testRequests) {
    console.log(`📝 Testing: ${test.name}`);
    
    try {
      // Write request to server stdin
      serverProcess.stdin?.write(JSON.stringify(test.request) + '\n');
      
      // For demo purposes, just log that we sent the request
      console.log(`   Request sent: ${test.request.method}`);
      console.log(`   Parameters:`, JSON.stringify(test.request.params, null, 2));
      console.log('');
      
    } catch (error) {
      console.error(`   Error: ${error}`);
    }
  }

  // Clean up
  setTimeout(() => {
    serverProcess.kill();
    console.log('✅ Test completed. Server terminated.');
  }, 2000);

  // Display server output
  if (serverProcess.stdout) {
    const reader = serverProcess.stdout.getReader();
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {break;}
        
        const text = decoder.decode(value);
        console.log('📤 Server response:', text);
      }
    } catch (error) {
      console.log('Server output ended.', error);
    }
  }
}

// Usage examples for documentation
console.log(`
📚 MCP Catalog API Server - Usage Examples

1. Search Products:
   {
     "name": "search_products",
     "arguments": {
       "query": "laptop",
       "category": "electronics",
       "minPrice": 500,
       "maxPrice": 2000,
       "inStockOnly": true,
       "sortBy": "price",
       "sortOrder": "asc"
     }
   }

2. Get Product Details:
   {
     "name": "get_product_details",
     "arguments": {
       "productId": "iphone-15-pro"
     }
   }

3. Browse Categories:
   {
     "name": "get_categories",
     "arguments": {
       "parentId": "electronics"
     }
   }

4. Get Recommendations:
   {
     "name": "get_product_recommendations",
     "arguments": {
       "productId": "iphone-15-pro",
       "limit": 3
     }
   }

5. Check Stock:
   {
     "name": "check_product_availability",
     "arguments": {
       "productId": "womens-dress"
     }
   }

6. Popular Products:
   {
     "name": "get_popular_products",
     "arguments": {
       "category": "electronics",
       "limit": 5,
       "minRating": 4.5
     }
   }

7. Price Analysis:
   {
     "name": "get_price_range",
     "arguments": {
       "category": "clothing"
     }
   }

🎯 To run the server manually:
   bun run start

🔧 For development with auto-reload:
   bun run dev
`);

// Run the test if this file is executed directly
if (import.meta.main) {
  testMCPServer().catch(console.error);
}
