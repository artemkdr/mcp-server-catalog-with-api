# System Architecture Summary

## Overview

This project implements a proper layered architecture for a catalog system using the Model Context Protocol (MCP). Instead of the MCP server directly accessing mock data, it now communicates with a standard REST API server, which in turn serves the catalog data.

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
│   Adapter)      │  - Validates requests
└─────────┬───────┘  - Transforms responses
          │ HTTP/REST
          │ 
          ▼
┌─────────────────┐
│  API Client     │  (src/api-client.ts)
│  (HTTP Client)  │  - HTTP client wrapper
└─────────┬───────┘  - Error handling
          │ HTTP requests
          │
          ▼
┌─────────────────┐
│  REST API       │  (src/server-example/api-server.ts)
│  Server         │  - Standard catalog API
│  (Business      │  - RESTful endpoints
│   Logic)        │  - Filtering & pagination
└─────────┬───────┘  - Standard HTTP responses
          │
          ▼
┌─────────────────┐
│   Mock Data     │  (src/server-example/mock-data.ts)
│   (Data Layer)  │  - Product catalog
└─────────────────┘  - Categories
```

## Key Benefits

### 1. **Separation of Concerns**
- **MCP Server**: Focuses purely on MCP protocol compliance
- **API Server**: Implements standard catalog business logic
- **API Client**: Handles HTTP communication and error mapping

### 2. **Standard REST API**
- Follows REST conventions (`GET /api/v1/products`, etc.)
- Standard HTTP status codes and response formats
- Easily consumed by other clients (web apps, mobile apps, etc.)
- Proper pagination, filtering, and search capabilities

### 3. **Scalability & Maintainability**
- API server can be deployed independently
- Multiple MCP servers can consume the same API
- API can serve multiple types of clients
- Easy to add authentication, caching, rate limiting to API layer

### 4. **Development & Testing**
- API can be tested independently with curl/Postman
- MCP server can be tested against different API implementations
- Clear boundaries make debugging easier
- Demo script validates the entire stack

## File Structure

```
├── src/
│   ├── server-example/
│       ├── api-server.ts # REST API server (Hono framework)
│   ├── demo.ts           # System demonstration script
│   ├── index.ts          # MCP server implementation
│   ├── api-client.ts     # HTTP client for REST API
│   ├── types.ts          # TypeScript type definitions
│   └── mock-data.ts      # Sample catalog data
├── eslint.config.mjs      # ESLint configuration
├── package.json          # Dependencies and scripts
└── README.md            # Documentation
```

## API Endpoints

The REST API provides standard catalog endpoints:

- **Products**: CRUD operations, search, filtering, sorting
- **Categories**: Hierarchical category management
- **Recommendations**: Product suggestions based on various criteria
- **Availability**: Real-time stock information
- **Popular Products**: Trending/highly-rated items
- **Price Ranges**: Category-based pricing information

## MCP Tools

The MCP server exposes these tools to MCP clients:

- `search_products` - Advanced product search with filters
- `get_product_details` - Detailed product information
- `get_categories` - Category hierarchy browsing
- `get_product_recommendations` - AI-powered recommendations
- `check_product_availability` - Stock status checking
- `get_popular_products` - Trending product discovery
- `get_price_range` - Category pricing insights

## Development Workflow

1. **Start API Server**: `bun run api-server`
2. **Test API**: `bun run demo` or use curl/Postman
3. **Start MCP Server**: `bun run mcp-server`
4. **Connect MCP Client**: Use with Claude, VS Code, etc.

This architecture provides a robust foundation for building catalog-based AI applications while maintaining standard web API practices.
