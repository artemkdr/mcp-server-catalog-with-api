/**
 * Category controller handling HTTP requests
 * Presentation layer for category operations
 */

import { Context } from 'hono';
import { ICategoryService } from '../interfaces/category-interface.js';

/**
 * Category controller handling HTTP request/response logic
 * Validates input, calls services, and formats responses
 */
export class CategoryController {
    constructor(private readonly categoryService: ICategoryService) {}

    /**
     * Get categories
     * @param c Hono context
     * @returns JSON response with categories
     */
    async getCategories(c: Context) {
        try {
            const parentId = c.req.query('parent_id');
            const includeProductCount = c.req.query('include_product_count') !== 'false';

            const result = await this.categoryService.getCategories(parentId, includeProductCount);

            return c.json(result);
        } catch (error) {
            console.error('Error in getCategories:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get category by ID
     * @param c Hono context
     * @returns JSON response with category data
     */
    async getCategoryById(c: Context) {
        try {
            const categoryId = c.req.param('id');
            const result = await this.categoryService.getCategoryById(categoryId);

            return c.json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Category not found') {
                return c.json({ error: 'Category not found' }, 404);
            }

            console.error('Error in getCategoryById:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get products in a category
     * @param c Hono context
     * @returns JSON response with category products
     */
    async getCategoryProducts(c: Context) {
        try {
            const categoryId = c.req.param('id');
            const page = parseInt(c.req.query('page') || '1');
            const limit = parseInt(c.req.query('limit') || '10');

            const result = await this.categoryService.getCategoryProducts(categoryId, page, limit);

            return c.json(result);
        } catch (error) {
            console.error('Error in getCategoryProducts:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }

    /**
     * Get price range for a category
     * @param c Hono context
     * @returns JSON response with price range data
     */
    async getCategoryPriceRange(c: Context) {
        try {
            const categoryId = c.req.param('id');
            const result = await this.categoryService.getCategoryPriceRange(categoryId);

            return c.json(result);
        } catch (error) {
            if (error instanceof Error && error.message.includes('No products found')) {
                return c.json(
                    {
                        error: 'No products found in this category',
                        categoryId: c.req.param('id'),
                    },
                    404,
                );
            }

            console.error('Error in getCategoryPriceRange:', error);
            return c.json({ error: 'Internal server error' }, 500);
        }
    }
}
