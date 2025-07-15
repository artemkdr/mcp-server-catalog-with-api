/**
 * Category repository implementation using mock data
 */

import { ICategoryRepository, Category, PaginationMeta, PriceRange } from '../interfaces/category-interface.js';
import { Product } from '../interfaces/product-interface.js';

/**
 * Mock data repository for categories
 * Implements data access layer for category operations
 */
export class CategoryRepository implements ICategoryRepository {
    constructor(
        private readonly categories: Category[],
        private readonly products: Product[],
    ) {}

    /**
     * Get all categories or subcategories
     * @param parentId Optional parent category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with categories
     */
    async getCategories(parentId?: string, includeProductCount = true): Promise<Category[]> {
        let result = this.categories;

        if (parentId) {
            const parentCategory = this.categories.find((c) => c.id === parentId);
            if (!parentCategory) {
                return [];
            }
            result = parentCategory.subcategories;
        }

        if (includeProductCount) {
            result = result.map((category) => ({
                ...category,
                productCount: this.products.filter((p) => p.category === category.id || p.subcategory === category.id)
                    .length,
            }));
        }

        return result;
    }

    /**
     * Get a category by ID
     * @param id Category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with category or null if not found
     */
    async getCategoryById(id: string, includeProductCount = true): Promise<Category | null> {
        const category = this.categories.find((c) => c.id === id);
        if (!category) {
            return null;
        }

        if (includeProductCount) {
            const productCount = this.products.filter((p) => p.category === id || p.subcategory === id).length;

            return {
                ...category,
                productCount,
            };
        }

        return category;
    }

    /**
     * Get products in a category with pagination
     * @param categoryId Category ID
     * @param page Page number
     * @param limit Items per page
     * @returns Promise with products and pagination
     */
    async getCategoryProducts(
        categoryId: string,
        page: number,
        limit: number,
    ): Promise<{ products: Product[]; meta: PaginationMeta }> {
        const categoryProducts = this.products.filter((p) => p.category === categoryId || p.subcategory === categoryId);

        const total = categoryProducts.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedProducts = categoryProducts.slice(offset, offset + limit);

        const meta: PaginationMeta = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };

        return { products: paginatedProducts, meta };
    }

    /**
     * Get price range for products in a category
     * @param categoryId Category ID
     * @returns Promise with price range or null if no products
     */
    async getCategoryPriceRange(categoryId: string): Promise<PriceRange | null> {
        const categoryProducts = this.products.filter((p) => p.category === categoryId || p.subcategory === categoryId);

        if (categoryProducts.length === 0) {
            return null;
        }

        const prices = categoryProducts.map((p) => p.price);
        const priceRange: PriceRange = {
            categoryId,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            averagePrice: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100,
            productCount: categoryProducts.length,
        };

        return priceRange;
    }
}
