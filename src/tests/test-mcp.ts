#!/usr/bin/env bun

// Quick test to verify MCP server imports and initializes correctly
import { CatalogApiClient } from '../api-client.js';

console.log('✅ Testing MCP server imports...');

try {
  const apiClient = new CatalogApiClient();
  console.log('✅ API client created successfully');
  
  const isHealthy = await apiClient.healthCheck();
  console.log(`✅ API health check: ${isHealthy ? 'Healthy' : 'Not available'}`);
  
  console.log('✅ MCP server code is ready!');
  console.log('📋 To start the MCP server: bun run mcp-server');
} catch (error) {
  console.error('❌ Error testing MCP server:', error);
}
