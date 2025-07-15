/**
 * Category service implementation
 * Business logic layer for category operations
 */

import {
    ICategoryService,
    ICategoryRepository,
    Category,
    PaginationMeta,
    PriceRange,
} from '../interfaces/category-interface.js';
import { Product } from '../interfaces/product-interface.js';

/**
 * Category service implementing business logic
 * Acts as an intermediary between controllers and repositories
 */
export class CategoryService implements ICategoryService {
    constructor(private readonly categoryRepository: ICategoryRepository) {}

    /**
     * Get categories
     * @param parentId Optional parent category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with categories response
     */
    async getCategories(parentId?: string, includeProductCount?: boolean): Promise<{ data: Category[] }> {
        const categories = await this.categoryRepository.getCategories(parentId, includeProductCount);

        return { data: categories };
    }

    /**
     * Get category by ID
     * @param id Category ID
     * @returns Promise with category data
     * @throws Error if category not found
     */
    async getCategoryById(id: string): Promise<{ data: Category }> {
        const category = await this.categoryRepository.getCategoryById(id, true);

        if (!category) {
            throw new Error('Category not found');
        }

        return { data: category };
    }

    /**
     * Get products in a category
     * @param categoryId Category ID
     * @param page Page number
     * @param limit Items per page
     * @returns Promise with category products response
     */
    async getCategoryProducts(
        categoryId: string,
        page: number,
        limit: number,
    ): Promise<{ data: Product[]; pagination: PaginationMeta }> {
        const { products, meta } = await this.categoryRepository.getCategoryProducts(categoryId, page, limit);

        return {
            data: products,
            pagination: meta,
        };
    }

    /**
     * Get price range for a category
     * @param categoryId Category ID
     * @returns Promise with price range data
     * @throws Error if category has no products
     */
    async getCategoryPriceRange(categoryId: string): Promise<{ data: PriceRange }> {
        const priceRange = await this.categoryRepository.getCategoryPriceRange(categoryId);

        if (!priceRange) {
            throw new Error(`No products found in this category: ${categoryId}`);
        }

        return { data: priceRange };
    }
}
