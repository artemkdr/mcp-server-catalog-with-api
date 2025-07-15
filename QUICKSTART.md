# MCP Catalog API Server - Quick Start Guide

## Overview
This MCP (Model Context Protocol) server provides a comprehensive catalog API built with Bun. It's designed to be integrated with MCP-compatible clients like Claude Desktop, VS Code with MCP extensions, or custom applications.

## Quick Start

### 1. Installation
```bash
# Navigate to the project directory
cd mcp-server-catalog-with-api

# Install dependencies (already done)
bun install

# Start the server
bun start
```

### 2. Configuration for Claude Desktop

Add this to your Claude Desktop MCP configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "catalog-api": {
      "command": "bun",
      "args": ["run", "C:\\dev\\mcp-server-catalog-with-api\\index.ts"]
    }
  }
}
```

### 3. Available Tools

Once configured, you can use these tools:

#### 🔍 Product Search
```
Search for products using:
- Text queries ("search for laptops")
- Category filters ("show electronics")
- Price ranges ("find products under $100")
- Brand filtering ("show Apple products")
- Stock availability ("only in-stock items")
```

#### 📦 Product Details
```
Get detailed product information:
- "Show details for product iphone-15-pro"
- "What are the specifications of macbook-pro-m3?"
```

#### 🏷️ Category Browsing
```
Explore the catalog structure:
- "Show all categories"
- "What subcategories are in electronics?"
- "List clothing categories"
```

#### 💡 Recommendations
```
Get product suggestions:
- "Recommend products similar to iPhone 15 Pro"
- "Show popular electronics"
- "What are trending products in clothing?"
```

#### 📊 Inventory & Pricing
```
Check availability and pricing:
- "Is the MacBook Pro in stock?"
- "What's the price range for electronics?"
- "Show me popular products with high ratings"
```

## Sample Interactions

### Example 1: Product Search
**You**: "Find Apple products that are in stock, sorted by price"
**Server response**: Returns iPhone 15 Pro and MacBook Pro with full details, pricing, and availability.

### Example 2: Category Exploration
**You**: "What categories do you have and how many products in each?"
**Server response**: Shows Electronics (23 products) and Clothing (55 products) with subcategories.

### Example 3: Product Recommendations
**You**: "Recommend products similar to the iPhone 15 Pro"
**Server response**: Returns MacBook Pro M3 (same brand) and other highly-rated electronics.

## Sample Data Included

The server comes with sample data:

### Products:
- **iPhone 15 Pro** ($999) - Premium smartphone
- **MacBook Pro M3** ($1,599) - Professional laptop  
- **Men's Casual Shirt** ($49.99) - Cotton clothing
- **Women's Summer Dress** ($79.99) - Seasonal fashion

### Categories:
- **Electronics** → Smartphones, Laptops
- **Clothing** → Men's Clothing, Women's Clothing

## Development Mode

For development with auto-reload:
```bash
bun dev
```

## Testing the Server

### Run the demo of MCP server:
```bash
bun test-mcp-server
```

### Run the demo of the API client used by the MCP server:
```bash
bun api-client-demo
```


This shows example requests and responses.

## Extending the Catalog

To add more products or categories, edit the `products` and `categories` arrays in `src/server-example/repositories/mock-data.ts`. 

For production use, you would:
1. Connect to a real database
2. Add authentication/authorization
3. Implement proper error handling
4. Add logging and monitoring
5. Scale with caching and indexing

## Troubleshooting

### Server won't start
- Ensure Bun is installed: `bun --version`
- Install bun if not present: `npm install -g bun`
- Check dependencies: `bun install`

### Tools not appearing in MCP client
- Check MCP configuration file path
- Verify server path is absolute
- For Claude: restart Claude Desktop after config changes

### Server exits immediately
- The server runs in stdio mode (normal behavior)
- It waits for MCP client connections
- Use with an MCP-compatible client, not standalone

## Support

This is a demonstration/educational project. For production use:
- Implement proper database connectivity
- Add comprehensive error handling
- Include authentication and rate limiting
- Add logging and monitoring
- Write comprehensive tests

---

**Happy cataloging! 🛍️**
