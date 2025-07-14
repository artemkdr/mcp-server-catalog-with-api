import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { products, categories } from './mock-data.js';

const app = new Hono();

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
app.get('/api/v1/products', (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const category = c.req.query('category');
  const brand = c.req.query('brand');
  const inStock = c.req.query('in_stock') === 'true';
  const sortBy = c.req.query('sort_by') || 'name';
  const sortOrder = c.req.query('sort_order') || 'asc';
  const minPrice = c.req.query('min_price') ? parseFloat(c.req.query('min_price')!) : undefined;
  const maxPrice = c.req.query('max_price') ? parseFloat(c.req.query('max_price')!) : undefined;

  let filteredProducts = [...products];

  // Apply filters
  if (category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category === category || p.subcategory === category,
    );
  }

  if (brand) {
    filteredProducts = filteredProducts.filter(p => 
      p.brand.toLowerCase() === brand.toLowerCase(),
    );
  }

  if (inStock) {
    filteredProducts = filteredProducts.filter(p => p.inStock);
  }

  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Apply pagination
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  return c.json({
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      category,
      brand,
      inStock,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    },
  });
});

app.get('/api/v1/products/search', (c) => {
  const query = c.req.query('q') || '';
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const category = c.req.query('category');

  const searchResults = products.filter(product => {
    const matchesQuery = query === '' || 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory = !category || 
      product.category === category || 
      product.subcategory === category;

    return matchesQuery && matchesCategory;
  });

  // Sort by relevance (basic scoring)
  if (query) {
    searchResults.sort((a, b) => {
      const aScore = (a.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                    (a.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
      const bScore = (b.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                    (b.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
      return bScore - aScore;
    });
  }

  // Pagination
  const total = searchResults.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedResults = searchResults.slice(offset, offset + limit);

  // Generate facets for search results
  const categoryFacets = [...new Set(searchResults.map(p => p.category))]
    .map(cat => ({
      value: cat,
      count: searchResults.filter(p => p.category === cat).length,
    }));

  const brandFacets = [...new Set(searchResults.map(p => p.brand))]
    .map(brand => ({
      value: brand,
      count: searchResults.filter(p => p.brand === brand).length,
    }));

  return c.json({
    query,
    data: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    facets: {
      categories: categoryFacets,
      brands: brandFacets,
    },
  });
});

app.get('/api/v1/products/:id', (c) => {
  const productId = c.req.param('id');
  const product = products.find(p => p.id === productId);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ data: product });
});

app.get('/api/v1/products/:id/recommendations', (c) => {
  const productId = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '5');
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  const recommendations = products
    .filter(p => p.id !== productId && 
            (p.category === product.category || p.brand === product.brand))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return c.json({ data: recommendations });
});

app.get('/api/v1/products/:id/availability', (c) => {
  const productId = c.req.param('id');
  const product = products.find(p => p.id === productId);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  const availability = {
    productId: product.id,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    availability: product.inStock ? 
      (product.stockQuantity > 10 ? 'in_stock' : 'limited_stock') : 
      'out_of_stock',
    lastUpdated: new Date().toISOString(),
  };

  return c.json({ data: availability });
});

// Categories endpoints
app.get('/api/v1/categories', (c) => {
  const parentId = c.req.query('parent_id');
  const includeProductCount = c.req.query('include_product_count') !== 'false';

  let result = categories;
  
  if (parentId) {
    const parentCategory = categories.find(c => c.id === parentId);
    if (!parentCategory) {
      return c.json({ error: 'Parent category not found' }, 404);
    }
    result = parentCategory.subcategories;
  }

  if (includeProductCount) {
    result = result.map(category => ({
      ...category,
      productCount: products.filter(p => 
        p.category === category.id || p.subcategory === category.id,
      ).length,
    }));
  }

  return c.json({ data: result });
});

app.get('/api/v1/categories/:id', (c) => {
  const categoryId = c.req.param('id');
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  const productCount = products.filter(p => 
    p.category === categoryId || p.subcategory === categoryId,
  ).length;

  return c.json({ 
    data: {
      ...category,
      productCount,
    },
  });
});

app.get('/api/v1/categories/:id/products', (c) => {
  const categoryId = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const categoryProducts = products.filter(p => 
    p.category === categoryId || p.subcategory === categoryId,
  );

  const total = categoryProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = categoryProducts.slice(offset, offset + limit);

  return c.json({
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// Popular products endpoint
app.get('/api/v1/products/popular', (c) => {
  const category = c.req.query('category');
  const limit = parseInt(c.req.query('limit') || '10');
  const minRating = parseFloat(c.req.query('min_rating') || '4.0');

  let popularProducts = products
    .filter(p => p.rating >= minRating)
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));

  if (category) {
    popularProducts = popularProducts.filter(p => 
      p.category === category || p.subcategory === category,
    );
  }

  popularProducts = popularProducts.slice(0, limit);

  return c.json({ data: popularProducts });
});

// Price range endpoint
app.get('/api/v1/categories/:id/price-range', (c) => {
  const categoryId = c.req.param('id');
  
  const categoryProducts = products.filter(p => 
    p.category === categoryId || p.subcategory === categoryId,
  );

  if (categoryProducts.length === 0) {
    return c.json({ 
      error: 'No products found in this category',
      categoryId,
    }, 404);
  }

  const prices = categoryProducts.map(p => p.price);
  const priceRange = {
    categoryId,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    averagePrice: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
    productCount: categoryProducts.length,
  };

  return c.json({ data: priceRange });
});

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
