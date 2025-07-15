# System Architecture Summary

## Overview

This project demonstrates how to build a Model Context Protocol (MCP) server that consumes a REST API to provide catalog functionality. The key focus is on the **MCP protocol implementation** and **API integration patterns**, showing how to properly bridge MCP tools with external REST APIs while maintaining type safety and proper error handling.

## Architecture Layers

```
┌─────────────────┐
│   MCP Client    │  (VS Code, Claude, etc.)
│   (Consumer)    │
└─────────┬───────┘
          │ MCP Protocol
          │ (stdio/transport)
          ▼
┌─────────────────┐
│   MCP Server    │  (src/index.ts)
│  (Protocol      │  - Implements MCP tools
│   Adapter)      │  - Validates requests with Zod
└─────────┬───────┘  - Transforms responses
          │ HTTP/REST
          │ 
          ▼
┌─────────────────┐
│  API Client     │  (src/api-client.ts)
│  (HTTP Client)  │  - HTTP client wrapper
└─────────┬───────┘  - Error handling & mapping
          │ HTTP requests
          │
          ▼
┌─────────────────┐
│  REST API       │  (External/Example API)
│  Server         │  - Standard catalog endpoints
│  (Data Source)  │  - RESTful conventions
└─────────────────┘  - JSON responses
```

## Key Benefits

### 1. **MCP Protocol Implementation**
- **Tool Registration**: Proper MCP tool definitions with Zod schemas
- **Request Validation**: Input validation using TypeScript and Zod
- **Error Handling**: Proper MCP error codes and error mapping
- **Type Safety**: Full TypeScript integration throughout the MCP layer

### 2. **API Integration Patterns**
- **HTTP Client Abstraction**: Clean wrapper around fetch API
- **Error Mapping**: HTTP status codes mapped to appropriate MCP errors
- **Response Transformation**: API responses transformed to MCP tool responses
- **Connection Management**: Proper handling of API connectivity and timeouts

### 3. **Separation of Concerns**
- **MCP Server**: Focuses purely on MCP protocol compliance
- **API Client**: Handles HTTP communication and error mapping
- **External API**: Can be any REST API following standard conventions

### 4. **Scalability & Flexibility**
- **API Agnostic**: Can work with any catalog API that follows REST conventions
- **Multiple Clients**: Same API can serve web apps, mobile apps, other MCP servers
- **Easy Configuration**: Simple configuration changes to point to different APIs
- **Development/Production**: Easy to switch between local and remote APIs

## File Structure

```
├── src/
│   ├── index.ts                    # MCP server implementation
│   ├── api-client.ts               # HTTP client for REST API
│   ├── types.ts                    # Shared TypeScript types
│   ├── tests/                      # Testing & demonstration
│   │   ├── api-client-demo.ts      # Demonstrates API client usage
│   │   ├── test-mcp-server.ts      # Run MCP example requests
│   └── server-example/             # Example API server (for development)
│       └── ...                     # Implementation details (not project focus)
├── package.json                    # Dependencies and scripts
├── mcp-client-config.json         # MCP client configuration
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── ARCHITECTURE.md                # This documentation
├── QUICKSTART.md                  # Quick start guide
└── README.md                      # Project documentation
```

### Core Files

- **`src/index.ts`** - The main MCP server that implements all catalog tools
- **`src/api-client.ts`** - HTTP client wrapper for communicating with the catalog API
- **`src/types.ts`** - TypeScript interfaces shared between MCP server and API client

## API Integration

The MCP server consumes a standard REST API with these catalog endpoints:

### Products
- **GET** `/api/v1/products` - List products with filtering, pagination, and sorting
- **GET** `/api/v1/products/search` - Advanced product search with query string
- **GET** `/api/v1/products/popular` - Get popular/trending products by rating
- **GET** `/api/v1/products/:id` - Get detailed product information
- **GET** `/api/v1/products/:id/recommendations` - Get product recommendations
- **GET** `/api/v1/products/:id/availability` - Check product availability and stock

### Categories  
- **GET** `/api/v1/categories` - Get category hierarchy with product counts
- **GET** `/api/v1/categories/:id` - Get specific category details
- **GET** `/api/v1/categories/:id/products` - Get products in a category
- **GET** `/api/v1/categories/:id/price-range` - Get price range for category

### System
- **GET** `/health` - Health check endpoint
- **GET** `/api/v1` - API information and available endpoints

### API Contract
- **Request Format**: Standard HTTP with query parameters
- **Response Format**: JSON with consistent structure (`{data, pagination?, error?}`)
- **Error Handling**: Standard HTTP status codes (200, 400, 404, 500)
- **Pagination**: `page` and `pageSize` parameters with metadata in response

## MCP Tools

The MCP server exposes these tools to MCP clients with comprehensive validation:

- **`search_products`** - Advanced product search with filters, pagination, and sorting
- **`get_product_details`** - Detailed product information including specifications
- **`get_categories`** - Category hierarchy browsing with product counts
- **`get_product_recommendations`** - AI-powered recommendations based on product or criteria
- **`check_product_availability`** - Real-time stock status checking
- **`get_popular_products`** - Trending product discovery with rating filters
- **`get_price_range`** - Category-based pricing insights and statistics

### Tool Features
- **Zod Schema Validation**: All inputs validated with comprehensive schemas
- **Error Handling**: Proper error mapping from HTTP responses to MCP errors
- **Type Safety**: Full TypeScript type safety throughout the stack
- **Documentation**: Each tool includes detailed descriptions and parameter documentation

## Development Workflow

### 1. **Start Example API Server** (for development)
```bash
bun api-server
# Starts example API on http://localhost:3001 with hot reload
```

### 2. **Test API Integration**
```bash
# Run api client demo
bun api-client-demo

# Or test specific endpoints
curl http://localhost:3001/api/v1/products
curl http://localhost:3001/health
```

### 3. **Start MCP Server** 
```bash
bun mcp-server
# Starts MCP server with stdio transport
```

### 4. **Connect MCP Client**
Configure your MCP client (Claude, VS Code, etc.) to connect to the server using the provided `mcp-client-config.json`

### 5. **Development Commands**
```bash
# Development with hot reload
bun dev

# Type checking
bun typecheck

# Linting
bun lint
bun lint:fix

# Testing
bun test
```

### 6. **Using with Different APIs**
To use this MCP server with a different catalog API, simply:
1. Update the API base URL in `src/api-client.ts`
2. Ensure the target API follows the same REST conventions
3. Adjust error mappings if needed

## Technology Stack

### Core Framework
- **Bun**: Runtime and package manager
- **TypeScript**: Type-safe development
- **@modelcontextprotocol/sdk**: MCP protocol implementation

### MCP Development Tools
- **Zod**: Runtime type validation for MCP tool schemas
- **Fetch API**: HTTP client for REST API communication
- **ESLint + Prettier**: Code quality and formatting

### Key Patterns
- **MCP Tool Registration**: Using `server.registerTool()` with proper schemas
- **Error Mapping**: Converting HTTP errors to MCP errors
- **Type Safety**: TypeScript interfaces for API responses and MCP tools
- **Async/Await**: Modern async patterns for API communication

This architecture demonstrates how to build robust MCP servers that integrate with external APIs while maintaining type safety, proper error handling, and clean separation of concerns between MCP protocol handling and HTTP API communication.
