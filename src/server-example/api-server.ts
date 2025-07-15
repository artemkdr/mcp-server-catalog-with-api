import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { products, categories } from './repositories/mock-data.js';

// Import layered architecture components
import { ProductRepository } from './repositories/product-repository.js';
import { CategoryRepository } from './repositories/category-repository.js';
import { ProductService } from './services/product-service.js';
import { CategoryService } from './services/category-service.js';
import { ProductController } from './controllers/product-controller.js';
import { CategoryController } from './controllers/category-controller.js';

const app = new Hono();

// Initialize dependency injection container
// Repository layer - data access
const productRepository = new ProductRepository(products);
const categoryRepository = new CategoryRepository(categories, products);

// Service layer - business logic
const productService = new ProductService(productRepository);
const categoryService = new CategoryService(categoryRepository);

// Controller layer - HTTP handling
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version info
app.get('/api/v1', (c) => {
    return c.json({
        name: 'Catalog API',
        version: '1.0.0',
        description: 'REST API for product catalog management',
        endpoints: {
            products: '/api/v1/products',
            categories: '/api/v1/categories',
            search: '/api/v1/products/search',
        },
    });
});

// Products endpoints
app.get('/api/v1/products', (c) => productController.getProducts(c));

app.get('/api/v1/products/search', (c) => productController.searchProducts(c));

app.get('/api/v1/products/popular', (c) => productController.getPopularProducts(c));

app.get('/api/v1/products/:id', (c) => productController.getProductById(c));

app.get('/api/v1/products/:id/recommendations', (c) => productController.getProductRecommendations(c));

app.get('/api/v1/products/:id/availability', (c) => productController.getProductAvailability(c));

// Categories endpoints
app.get('/api/v1/categories', (c) => categoryController.getCategories(c));

app.get('/api/v1/categories/:id', (c) => categoryController.getCategoryById(c));

app.get('/api/v1/categories/:id/products', (c) => categoryController.getCategoryProducts(c));

app.get('/api/v1/categories/:id/price-range', (c) => categoryController.getCategoryPriceRange(c));

// Error handling
app.notFound((c) => {
    return c.json({ error: 'Endpoint not found' }, 404);
});

app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Catalog API Server starting on port ${port}`);
console.log(`📖 API Documentation available at http://localhost:${port}/api/v1`);

serve({
    fetch: app.fetch,
    port,
});
