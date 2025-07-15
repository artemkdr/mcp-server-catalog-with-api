/**
 * Category domain types and interfaces for the catalog API
 */

import { Product } from './product-interface.js';

/**
 * Category entity interface (from existing types)
 */
export interface Category {
    id: string;
    name: string;
    description: string;
    parentId?: string;
    subcategories: Category[];
    productCount: number;
}

/**
 * Category with products pagination
 */
export interface CategoryProductsParams {
    categoryId: string;
    page: number;
    limit: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Price range information for a category
 */
export interface PriceRange {
    categoryId: string;
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    productCount: number;
}

/**
 * Repository interface for category data access
 */
export interface ICategoryRepository {
    /**
     * Get all categories or subcategories
     * @param parentId Optional parent category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with categories
     */
    getCategories(parentId?: string, includeProductCount?: boolean): Promise<Category[]>;

    /**
     * Get a category by ID
     * @param id Category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with category or null if not found
     */
    getCategoryById(id: string, includeProductCount?: boolean): Promise<Category | null>;

    /**
     * Get products in a category with pagination
     * @param categoryId Category ID
     * @param page Page number
     * @param limit Items per page
     * @returns Promise with products and pagination
     */
    getCategoryProducts(
        categoryId: string,
        page: number,
        limit: number,
    ): Promise<{ products: Product[]; meta: PaginationMeta }>;

    /**
     * Get price range for products in a category
     * @param categoryId Category ID
     * @returns Promise with price range or null if no products
     */
    getCategoryPriceRange(categoryId: string): Promise<PriceRange | null>;
}

/**
 * Service interface for category business logic
 */
export interface ICategoryService {
    /**
     * Get categories
     * @param parentId Optional parent category ID
     * @param includeProductCount Whether to include product count
     * @returns Promise with categories response
     */
    getCategories(parentId?: string, includeProductCount?: boolean): Promise<{ data: Category[] }>;

    /**
     * Get category by ID
     * @param id Category ID
     * @returns Promise with category data
     * @throws Error if category not found
     */
    getCategoryById(id: string): Promise<{ data: Category }>;

    /**
     * Get products in a category
     * @param categoryId Category ID
     * @param page Page number
     * @param limit Items per page
     * @returns Promise with category products response
     */
    getCategoryProducts(
        categoryId: string,
        page: number,
        limit: number,
    ): Promise<{ data: Product[]; pagination: PaginationMeta }>;

    /**
     * Get price range for a category
     * @param categoryId Category ID
     * @returns Promise with price range data
     * @throws Error if category has no products
     */
    getCategoryPriceRange(categoryId: string): Promise<{ data: PriceRange }>;
}
