/**
 * Product service implementation
 * Business logic layer for product operations
 */

import {
    IProductService,
    IProductRepository,
    Product,
    ProductFilters,
    SearchFilters,
    PaginationParams,
    PaginationMeta,
    SearchFacets,
    ProductAvailability,
} from '../interfaces/product-interface.js';

/**
 * Product service implementing business logic
 * Acts as an intermediary between controllers and repositories
 */
export class ProductService implements IProductService {
    constructor(private readonly productRepository: IProductRepository) {}

    /**
     * Get products with filters and pagination
     * @param filters Product filters
     * @param pagination Pagination parameters
     * @returns Promise with products response
     */
    async getProducts(
        filters: ProductFilters,
        pagination: PaginationParams,
    ): Promise<{ data: Product[]; pagination: PaginationMeta; filters: ProductFilters }> {
        const { products, meta } = await this.productRepository.getProducts(filters, pagination);

        return {
            data: products,
            pagination: meta,
            filters,
        };
    }

    /**
     * Search products
     * @param searchFilters Search filters
     * @param pagination Pagination parameters
     * @returns Promise with search response
     */
    async searchProducts(
        searchFilters: SearchFilters,
        pagination: PaginationParams,
    ): Promise<{
        query: string;
        data: Product[];
        pagination: PaginationMeta;
        facets: SearchFacets;
    }> {
        const { products, meta, facets } = await this.productRepository.searchProducts(searchFilters, pagination);

        return {
            query: searchFilters.query || '',
            data: products,
            pagination: meta,
            facets,
        };
    }

    /**
     * Get product by ID
     * @param id Product ID
     * @returns Promise with product data
     * @throws Error if product not found
     */
    async getProductById(id: string): Promise<{ data: Product }> {
        const product = await this.productRepository.getProductById(id);

        if (!product) {
            throw new Error('Product not found');
        }

        return { data: product };
    }

    /**
     * Get product recommendations
     * @param productId Product ID
     * @param limit Number of recommendations
     * @returns Promise with recommendations
     * @throws Error if product not found
     */
    async getProductRecommendations(productId: string, limit: number): Promise<{ data: Product[] }> {
        // First check if the product exists
        const product = await this.productRepository.getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const recommendations = await this.productRepository.getProductRecommendations(productId, limit);

        return { data: recommendations };
    }

    /**
     * Get product availability
     * @param productId Product ID
     * @returns Promise with availability data
     * @throws Error if product not found
     */
    async getProductAvailability(productId: string): Promise<{ data: ProductAvailability }> {
        const availability = await this.productRepository.getProductAvailability(productId);

        if (!availability) {
            throw new Error('Product not found');
        }

        return { data: availability };
    }

    /**
     * Get popular products
     * @param category Optional category filter
     * @param limit Number of products
     * @param minRating Minimum rating
     * @returns Promise with popular products
     */
    async getPopularProducts(category?: string, limit?: number, minRating?: number): Promise<{ data: Product[] }> {
        const products = await this.productRepository.getPopularProducts(category, limit, minRating);

        return { data: products };
    }
}
