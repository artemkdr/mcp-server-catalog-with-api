import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { CatalogApiClient } from './api-client.js';
import type { Product, SearchResult } from './types.js';

// Initialize API client
const apiClient = new CatalogApiClient();

// Initialize MCP server
const server = new McpServer({
    name: 'catalog-api-server',
    version: '1.0.0',
});

// Register tools with the new API
server.registerTool(
    'search_products',
    {
        title: 'search_products',
        description: 'Search for products in the catalog with filters and pagination',
        inputSchema: {
            query: z.string().optional().describe('Search query string'),
            category: z.string().optional().describe('Filter by category ID'),
            brand: z.string().optional().describe('Filter by brand name'),
            minPrice: z.number().optional().describe('Minimum price filter'),
            maxPrice: z.number().optional().describe('Maximum price filter'),
            inStockOnly: z.boolean().default(false).describe('Show only products in stock'),
            page: z.number().default(1).describe('Page number for pagination'),
            pageSize: z.number().default(10).describe('Number of products per page'),
            sortBy: z.enum(['name', 'price', 'rating', 'createdAt']).default('name').describe('Sort products by field'),
            sortOrder: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
        },
    },
    async ({ query, category, brand, minPrice, maxPrice, inStockOnly, page, pageSize, sortBy, sortOrder }) => {
        const apiResponse = await apiClient.searchProducts({
            query,
            category,
            brand,
            minPrice,
            maxPrice,
            inStockOnly,
            page,
            pageSize,
            sortBy,
            sortOrder,
        });

        // Transform API response to match MCP tool response format
        const result: SearchResult = {
            products: apiResponse.data as Product[],
            totalCount: apiResponse.pagination?.total || 0,
            page: apiResponse.pagination?.page || 1,
            pageSize: apiResponse.pagination?.limit || 10,
            totalPages: apiResponse.pagination?.totalPages || 0,
            facets: {
                categories:
                    apiResponse.facets?.categories?.map((f) => ({
                        name: f.value,
                        count: f.count,
                    })) || [],
                brands:
                    apiResponse.facets?.brands?.map((f) => ({
                        name: f.value,
                        count: f.count,
                    })) || [],
                priceRanges: [], // Will be populated by separate API call if needed
            },
        };

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    },
);

server.registerTool(
    'get_product_details',
    {
        title: 'get_product_details',
        description: 'Get detailed information about a specific product',
        inputSchema: {
            productId: z.string().describe('Product ID to retrieve details for'),
        },
    },
    async ({ productId }) => {
        try {
            const apiResponse = await apiClient.getProductDetails(productId);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(apiResponse.data, null, 2),
                    },
                ],
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new McpError(ErrorCode.InvalidRequest, `Product with ID ${productId} not found`);
            }
            throw error;
        }
    },
);

server.registerTool(
    'get_categories',
    {
        title: 'get_categories',
        description: 'Get all product categories with hierarchy',
        inputSchema: {
            parentId: z.string().optional().describe('Get subcategories of a specific parent category'),
            includeProductCount: z.boolean().default(true).describe('Include product count for each category'),
        },
    },
    async ({ parentId, includeProductCount }) => {
        const apiResponse = await apiClient.getCategories(parentId, includeProductCount);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(apiResponse.data, null, 2),
                },
            ],
        };
    },
);

server.registerTool(
    'get_product_recommendations',
    {
        title: 'get_product_recommendations',
        description: 'Get product recommendations based on a product or search criteria',
        inputSchema: {
            productId: z.string().optional().describe('Get recommendations based on this product'),
            category: z.string().optional().describe('Get recommendations from this category'),
            limit: z.number().default(5).describe('Number of recommendations to return'),
        },
    },
    async ({ productId, category, limit }) => {
        let apiResponse;

        if (productId) {
            try {
                apiResponse = await apiClient.getProductRecommendations(productId, limit);
            } catch (error) {
                if (error instanceof Error && error.message.includes('404')) {
                    throw new McpError(ErrorCode.InvalidRequest, `Product with ID ${productId} not found`);
                }
                throw error;
            }
        } else if (category) {
            apiResponse = await apiClient.getGeneralRecommendations(category, limit);
        } else {
            throw new McpError(
                ErrorCode.InvalidRequest,
                'Either productId or category must be provided for recommendations',
            );
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(apiResponse.data, null, 2),
                },
            ],
        };
    },
);

server.registerTool(
    'check_product_availability',
    {
        title: 'check_product_availability',
        description: 'Check product availability and stock information',
        inputSchema: {
            productId: z.string().describe('Product ID to check availability'),
        },
    },
    async ({ productId }) => {
        try {
            const apiResponse = await apiClient.checkProductAvailability(productId);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(apiResponse.data, null, 2),
                    },
                ],
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new McpError(ErrorCode.InvalidRequest, `Product with ID ${productId} not found`);
            }
            throw error;
        }
    },
);

server.registerTool(
    'get_popular_products',
    {
        title: 'get_popular_products',
        description: 'Get popular products based on ratings and reviews',
        inputSchema: {
            category: z.string().optional().describe('Filter by category'),
            limit: z.number().default(10).describe('Number of products to return'),
            minRating: z.number().default(4.0).describe('Minimum rating threshold'),
        },
    },
    async ({ category, limit, minRating }) => {
        const apiResponse = await apiClient.getPopularProducts(category, limit, minRating);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(apiResponse.data, null, 2),
                },
            ],
        };
    },
);

server.registerTool(
    'get_price_range',
    {
        title: 'get_price_range',
        description: 'Get price range information for products in a category',
        inputSchema: {
            category: z.string().optional().describe('Category to get price range for'),
        },
    },
    async ({ category }) => {
        if (!category) {
            throw new McpError(ErrorCode.InvalidRequest, 'Category parameter is required for price range');
        }

        try {
            const apiResponse = await apiClient.getCategoryPriceRange(category);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(apiResponse.data, null, 2),
                    },
                ],
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new McpError(ErrorCode.InvalidRequest, `No products found in category ${category}`);
            }
            throw error;
        }
    },
);

export async function main() {
    // Check if API server is available
    const isApiHealthy = await apiClient.healthCheck();
    if (!isApiHealthy) {
        console.error('Warning: Catalog API server is not available. Make sure to start the API server first.');
        console.error('Run: bun run api-server');
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Catalog API MCP server running on stdio');
}

if (import.meta.main) {
    main().catch((error) => {
        console.error('Fatal error in main():', error);
        process.exit(1);
    });
}
