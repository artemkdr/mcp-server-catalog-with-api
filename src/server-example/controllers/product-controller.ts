/**
 * Product controller handling HTTP requests
 * Presentation layer for product operations
 */

import { Context } from 'hono';
import { IProductService, ProductFilters, SearchFilters, PaginationParams } from '../interfaces/product-interface.js';

/**
 * Product controller handling HTTP request/response logic
 * Validates input, calls services, and formats responses
 */
export class ProductController {
    constructor(private readonly productService: IProductService) {}

    /**
     * Get products with filters and pagination
     * @param c Hono context
     * @returns JSON response with products
     */
    async getProducts(c: Context) {
        try {
            const page = parseInt(c.req.query('page') || '1');
            const limit = parseInt(c.req.query('limit') || '10');
            const category = c.req.query('category');
            const brand = c.req.query('brand');
            const inStock = c.req.query('in_stock') === 'true';
            const sortBy = (c.req.query('sort_by') as ProductFilters['sortBy']) || 'name';
            const sortOrder = (c.req.query('sort_order') as ProductFilters['sortOrder']) || 'asc';
            const minPrice = c.req.query('min_price') ? parseFloat(c.req.query('min_price')!) : undefined;
            const maxPrice = c.req.query('max_price') ? parseFloat(c.req.query('max_price')!) : undefined;

            const filters: ProductFilters = {
                category,
                brand,
                inStock,
                sortBy,
                sortOrder,
                minPrice,
                maxPrice,
            };

            const pagination: PaginationParams = { page, limit };

            const result = await this.productService.getProducts(filters, pagination);

            return c.json(result);
        } catch (error) {
            console.error('Error in getProducts:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Search products
     * @param c Hono context
     * @returns JSON response with search results
     */
    async searchProducts(c: Context) {
        try {
            const query = c.req.query('q') || '';
            const page = parseInt(c.req.query('page') || '1');
            const limit = parseInt(c.req.query('limit') || '10');
            const category = c.req.query('category');

            const searchFilters: SearchFilters = {
                query,
                category,
            };

            const pagination: PaginationParams = { page, limit };

            const result = await this.productService.searchProducts(searchFilters, pagination);

            return c.json(result);
        } catch (error) {
            console.error('Error in searchProducts:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get product by ID
     * @param c Hono context
     * @returns JSON response with product data
     */
    async getProductById(c: Context) {
        try {
            const productId = c.req.param('id');
            const result = await this.productService.getProductById(productId);

            return c.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Product not found') {
                return c.json({ error: 'Product not found' }, 404);
            }

            console.error('Error in getProductById:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get product recommendations
     * @param c Hono context
     * @returns JSON response with recommendations
     */
    async getProductRecommendations(c: Context) {
        try {
            const productId = c.req.param('id');
            const limit = parseInt(c.req.query('limit') || '5');

            const result = await this.productService.getProductRecommendations(productId, limit);

            return c.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Product not found') {
                return c.json({ error: 'Product not found' }, 404);
            }

            console.error('Error in getProductRecommendations:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get product availability
     * @param c Hono context
     * @returns JSON response with availability data
     */
    async getProductAvailability(c: Context) {
        try {
            const productId = c.req.param('id');
            const result = await this.productService.getProductAvailability(productId);

            return c.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Product not found') {
                return c.json({ error: 'Product not found' }, 404);
            }

            console.error('Error in getProductAvailability:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get popular products
     * @param c Hono context
     * @returns JSON response with popular products
     */
    async getPopularProducts(c: Context) {
        try {
            const category = c.req.query('category');
            const limit = parseInt(c.req.query('limit') || '10');
            const minRating = parseFloat(c.req.query('min_rating') || '4.0');

            const result = await this.productService.getPopularProducts(category, limit, minRating);

            return c.json(result);
        } catch (error) {
            console.error('Error in getPopularProducts:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }
}
