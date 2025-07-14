#!/usr/bin/env bun

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CatalogApiClient } from './api-client.js';
import type { Product, SearchResult } from './types.js';

// Initialize API client
const apiClient = new CatalogApiClient();

const server = new Server(
  {
    name: 'catalog-api-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_products',
        description: 'Search for products in the catalog with filters and pagination',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            category: {
              type: 'string',
              description: 'Filter by category ID',
            },
            brand: {
              type: 'string',
              description: 'Filter by brand name',
            },
            minPrice: {
              type: 'number',
              description: 'Minimum price filter',
            },
            maxPrice: {
              type: 'number',
              description: 'Maximum price filter',
            },
            inStockOnly: {
              type: 'boolean',
              description: 'Show only products in stock',
              default: false,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
            pageSize: {
              type: 'number',
              description: 'Number of products per page',
              default: 10,
            },
            sortBy: {
              type: 'string',
              enum: ['name', 'price', 'rating', 'createdAt'],
              description: 'Sort products by field',
              default: 'name',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
              default: 'asc',
            },
          },
        },
      },
      {
        name: 'get_product_details',
        description: 'Get detailed information about a specific product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID to retrieve details for',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'get_categories',
        description: 'Get all product categories with hierarchy',
        inputSchema: {
          type: 'object',
          properties: {
            parentId: {
              type: 'string',
              description: 'Get subcategories of a specific parent category',
            },
            includeProductCount: {
              type: 'boolean',
              description: 'Include product count for each category',
              default: true,
            },
          },
        },
      },
      {
        name: 'get_product_recommendations',
        description: 'Get product recommendations based on a product or search criteria',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Get recommendations based on this product',
            },
            category: {
              type: 'string',
              description: 'Get recommendations from this category',
            },
            limit: {
              type: 'number',
              description: 'Number of recommendations to return',
              default: 5,
            },
          },
        },
      },
      {
        name: 'check_product_availability',
        description: 'Check product availability and stock information',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID to check availability',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'get_popular_products',
        description: 'Get popular products based on ratings and reviews',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category',
            },
            limit: {
              type: 'number',
              description: 'Number of products to return',
              default: 10,
            },
            minRating: {
              type: 'number',
              description: 'Minimum rating threshold',
              default: 4.0,
            },
          },
        },
      },
      {
        name: 'get_price_range',
        description: 'Get price range information for products in a category',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category to get price range for',
            },
          },
        },
      },
    ],
  };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_products': {
        const {
          query,
          category,
          brand,
          minPrice,
          maxPrice,
          inStockOnly = false,
          page = 1,
          pageSize = 10,
          sortBy = 'name',
          sortOrder = 'asc',
        } = args as {
          query?: string;
          category?: string;
          brand?: string;
          minPrice?: number;
          maxPrice?: number;
          inStockOnly?: boolean;
          page?: number;
          pageSize?: number;
          sortBy?: string;
          sortOrder?: string;
        };

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
            categories: apiResponse.facets?.categories?.map(f => ({ name: f.value, count: f.count })) || [],
            brands: apiResponse.facets?.brands?.map(f => ({ name: f.value, count: f.count })) || [],
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
      }

      case 'get_product_details': {
        const { productId } = args as { productId: string };
        
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
      }

      case 'get_categories': {
        const { parentId, includeProductCount = true } = args as {
          parentId?: string;
          includeProductCount?: boolean;
        };
        
        const apiResponse = await apiClient.getCategories(parentId, includeProductCount);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(apiResponse.data, null, 2),
            },
          ],
        };
      }

      case 'get_product_recommendations': {
        const { productId, category, limit = 5 } = args as {
          productId?: string;
          category?: string;
          limit?: number;
        };
        
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
        } else {
          apiResponse = await apiClient.getGeneralRecommendations(category, limit);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(apiResponse.data, null, 2),
            },
          ],
        };
      }

      case 'check_product_availability': {
        const { productId } = args as { productId: string };
        
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
      }

      case 'get_popular_products': {
        const { category, limit = 10, minRating = 4.0 } = args as {
          category?: string;
          limit?: number;
          minRating?: number;
        };
        
        const apiResponse = await apiClient.getPopularProducts(category, limit, minRating);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(apiResponse.data, null, 2),
            },
          ],
        };
      }

      case 'get_price_range': {
        const { category } = args as { category?: string };
        
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
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error}`);
  }
});

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
