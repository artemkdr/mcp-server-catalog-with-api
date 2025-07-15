/**
 * Product domain types and interfaces for the catalog API
 */

/**
 * Product filters for searching and filtering products
 */
export interface ProductFilters {
    category?: string;
    brand?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'rating' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Search filters extending product filters
 */
export interface SearchFilters extends ProductFilters {
    query?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
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
 * Search facets for filtering
 */
export interface SearchFacets {
    categories: Array<{ value: string; count: number }>;
    brands: Array<{ value: string; count: number }>;
}

/**
 * Product availability information
 */
export interface ProductAvailability {
    productId: string;
    inStock: boolean;
    stockQuantity: number;
    availability: 'in_stock' | 'limited_stock' | 'out_of_stock';
    lastUpdated: string;
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
 * Product entity interface (from existing types)
 */
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    subcategory?: string;
    brand: string;
    sku: string;
    inStock: boolean;
    stockQuantity: number;
    images: string[];
    attributes: Record<string, string | number | boolean>;
    rating: number;
    reviewCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Repository interface for product data access
 */
export interface IProductRepository {
    /**
     * Get all products with optional filters and pagination
     * @param filters Product filters
     * @param pagination Pagination parameters
     * @returns Promise with products and pagination metadata
     */
    getProducts(
        filters: ProductFilters,
        pagination: PaginationParams,
    ): Promise<{ products: Product[]; meta: PaginationMeta }>;

    /**
     * Search products by query with filters and pagination
     * @param searchFilters Search filters including query
     * @param pagination Pagination parameters
     * @returns Promise with search results, pagination, and facets
     */
    searchProducts(
        searchFilters: SearchFilters,
        pagination: PaginationParams,
    ): Promise<{ products: Product[]; meta: PaginationMeta; facets: SearchFacets }>;

    /**
     * Get a product by ID
     * @param id Product ID
     * @returns Promise with product or null if not found
     */
    getProductById(id: string): Promise<Product | null>;

    /**
     * Get product recommendations based on a product
     * @param productId Product ID
     * @param limit Number of recommendations
     * @returns Promise with recommended products
     */
    getProductRecommendations(productId: string, limit: number): Promise<Product[]>;

    /**
     * Get product availability information
     * @param productId Product ID
     * @returns Promise with availability info or null if not found
     */
    getProductAvailability(productId: string): Promise<ProductAvailability | null>;

    /**
     * Get popular products with optional category filter
     * @param category Optional category filter
     * @param limit Number of products to return
     * @param minRating Minimum rating threshold
     * @returns Promise with popular products
     */
    getPopularProducts(category?: string, limit?: number, minRating?: number): Promise<Product[]>;
}

/**
 * Service interface for product business logic
 */
export interface IProductService {
    /**
     * Get products with filters and pagination
     * @param filters Product filters
     * @param pagination Pagination parameters
     * @returns Promise with products response
     */
    getProducts(
        filters: ProductFilters,
        pagination: PaginationParams,
    ): Promise<{ data: Product[]; pagination: PaginationMeta; filters: ProductFilters }>;

    /**
     * Search products
     * @param searchFilters Search filters
     * @param pagination Pagination parameters
     * @returns Promise with search response
     */
    searchProducts(
        searchFilters: SearchFilters,
        pagination: PaginationParams,
    ): Promise<{
        query: string;
        data: Product[];
        pagination: PaginationMeta;
        facets: SearchFacets;
    }>;

    /**
     * Get product by ID
     * @param id Product ID
     * @returns Promise with product data
     * @throws Error if product not found
     */
    getProductById(id: string): Promise<{ data: Product }>;

    /**
     * Get product recommendations
     * @param productId Product ID
     * @param limit Number of recommendations
     * @returns Promise with recommendations
     * @throws Error if product not found
     */
    getProductRecommendations(productId: string, limit: number): Promise<{ data: Product[] }>;

    /**
     * Get product availability
     * @param productId Product ID
     * @returns Promise with availability data
     * @throws Error if product not found
     */
    getProductAvailability(productId: string): Promise<{ data: ProductAvailability }>;

    /**
     * Get popular products
     * @param category Optional category filter
     * @param limit Number of products
     * @param minRating Minimum rating
     * @returns Promise with popular products
     */
    getPopularProducts(category?: string, limit?: number, minRating?: number): Promise<{ data: Product[] }>;
}
