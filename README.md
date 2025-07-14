# MCP Server Catalog with API

A Model Context Protocol (MCP) server that provides catalog functionality through a REST API layer. This project demonstrates a proper architecture where the MCP server acts as a client to a catalog API, rather than directly accessing data.

## Architecture

```
Claude/MCP Client → MCP Server → REST API Server → Mock Data
```

- **REST API Server** (`src/server-example/api-server.ts`): Standard catalog API with endpoints for products, 
- **Mock Data** (`src/server-example/mock-data.ts`): Sample product and category data categories, search, etc.
- **MCP Server** (`src/index.ts`): MCP protocol server that consumes the REST API
- **API Client** (`src/api-client.ts`): HTTP client for communicating with the REST API


## Features

### REST API Endpoints

- `GET /api/v1/products` - List products with filtering and pagination
- `GET /api/v1/products/search` - Search products with facets
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/:id/recommendations` - Get product recommendations
- `GET /api/v1/products/:id/availability` - Check product availability
- `GET /api/v1/products/popular` - Get popular products
- `GET /api/v1/categories` - List categories with hierarchy
- `GET /api/v1/categories/:id` - Get category details
- `GET /api/v1/categories/:id/products` - Get products in category
- `GET /api/v1/categories/:id/price-range` - Get price range for category

### MCP Tools

- `search_products` - Search for products with filters and pagination
- `get_product_details` - Get detailed product information
- `get_categories` - Get product categories with hierarchy
- `get_product_recommendations` - Get product recommendations
- `check_product_availability` - Check product availability and stock
- `get_popular_products` - Get popular products by rating
- `get_price_range` - Get price range information for categories

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Installation

```bash
bun install
```

### Running the System

1. **Start the API Server** (Terminal 1):
```bash
bun run api-server
```
This starts the REST API server on http://localhost:3001

2. **Start the MCP Server** (Terminal 2):
```bash
bun run mcp-server
```
This starts the MCP server that connects to the API server

### Development

- **API Server with hot reload**:
```bash
bun run api-server
```

- **Run linting**:
```bash
bun run lint
bun run lint:fix
```

### Testing the API

You can test the REST API directly:

```bash
# Get all products
curl "http://localhost:3001/api/v1/products"

# Search products
curl "http://localhost:3001/api/v1/products/search?q=laptop"

# Get product details
curl "http://localhost:3001/api/v1/products/1"

# Get categories
curl "http://localhost:3001/api/v1/categories"
```

### API Documentation

Visit http://localhost:3001/api/v1 for API information and available endpoints.

### Health Check

Check if the API server is running:
```bash
curl "http://localhost:3001/health"
```

## Configuration

### API Server

- Port: `3001` (configurable via `PORT` environment variable)
- CORS: Enabled for all origins
- Request logging: Enabled

### MCP Server

- Protocol: stdio transport
- API client base URL: `http://localhost:3001`

## Development Notes

- The project uses ESLint with TypeScript support and modern flat config
- Code style enforces single quotes, trailing commas, and consistent formatting
- Both servers support hot reload during development
- The MCP server checks API server health on startup

## Example Usage

Once both servers are running, you can use the MCP server with Claude or other MCP clients to:

1. Search for products: "Find laptops under $1000"
2. Get recommendations: "Show me products similar to product ID 1"
3. Check availability: "Is product 5 in stock?"
4. Browse categories: "What product categories are available?"
5. Find popular items: "Show me the most popular electronics"
