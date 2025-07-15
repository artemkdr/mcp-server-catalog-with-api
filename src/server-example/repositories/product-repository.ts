/**
 * Product repository implementation using mock data
 */

import {
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
 * Mock data repository for products
 * Implements data access layer for product operations
 */
export class ProductRepository implements IProductRepository {
    constructor(private readonly products: Product[]) {}

    /**
     * Get all products with optional filters and pagination
     * @param filters Product filters
     * @param pagination Pagination parameters
     * @returns Promise with products and pagination metadata
     */
    async getProducts(
        filters: ProductFilters,
        pagination: PaginationParams,
    ): Promise<{ products: Product[]; meta: PaginationMeta }> {
        let filteredProducts = [...this.products];

        // Apply filters
        if (filters.category) {
            filteredProducts = filteredProducts.filter(
                (p) => p.category === filters.category || p.subcategory === filters.category,
            );
        }

        if (filters.brand) {
            filteredProducts = filteredProducts.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
        }

        if (filters.inStock) {
            filteredProducts = filteredProducts.filter((p) => p.inStock);
        }

        if (filters.minPrice !== undefined) {
            filteredProducts = filteredProducts.filter((p) => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter((p) => p.price <= filters.maxPrice!);
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'name';
        const sortOrder = filters.sortOrder || 'asc';

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
        const totalPages = Math.ceil(total / pagination.limit);
        const offset = (pagination.page - 1) * pagination.limit;
        const paginatedProducts = filteredProducts.slice(offset, offset + pagination.limit);

        const meta: PaginationMeta = {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        };

        return { products: paginatedProducts, meta };
    }

    /**
     * Search products by query with filters and pagination
     * @param searchFilters Search filters including query
     * @param pagination Pagination parameters
     * @returns Promise with search results, pagination, and facets
     */
    async searchProducts(
        searchFilters: SearchFilters,
        pagination: PaginationParams,
    ): Promise<{ products: Product[]; meta: PaginationMeta; facets: SearchFacets }> {
        const query = searchFilters.query || '';

        const searchResults = this.products.filter((product) => {
            const matchesQuery =
                query === '' ||
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

            const matchesCategory =
                !searchFilters.category ||
                product.category === searchFilters.category ||
                product.subcategory === searchFilters.category;

            return matchesQuery && matchesCategory;
        });

        // Sort by relevance (basic scoring)
        if (query) {
            searchResults.sort((a, b) => {
                const aScore =
                    (a.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                    (a.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
                const bScore =
                    (b.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                    (b.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
                return bScore - aScore;
            });
        }

        // Pagination
        const total = searchResults.length;
        const totalPages = Math.ceil(total / pagination.limit);
        const offset = (pagination.page - 1) * pagination.limit;
        const paginatedResults = searchResults.slice(offset, offset + pagination.limit);

        // Generate facets for search results
        const categoryFacets = [...new Set(searchResults.map((p) => p.category))].map((cat) => ({
            value: cat,
            count: searchResults.filter((p) => p.category === cat).length,
        }));

        const brandFacets = [...new Set(searchResults.map((p) => p.brand))].map((brand) => ({
            value: brand,
            count: searchResults.filter((p) => p.brand === brand).length,
        }));

        const meta: PaginationMeta = {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        };

        const facets: SearchFacets = {
            categories: categoryFacets,
            brands: brandFacets,
        };

        return { products: paginatedResults, meta, facets };
    }

    /**
     * Get a product by ID
     * @param id Product ID
     * @returns Promise with product or null if not found
     */
    async getProductById(id: string): Promise<Product | null> {
        const product = this.products.find((p) => p.id === id);
        return product || null;
    }

    /**
     * Get product recommendations based on a product
     * @param productId Product ID
     * @param limit Number of recommendations
     * @returns Promise with recommended products
     */
    async getProductRecommendations(productId: string, limit: number): Promise<Product[]> {
        const product = await this.getProductById(productId);
        if (!product) {
            return [];
        }

        const recommendations = this.products
            .filter((p) => p.id !== productId && (p.category === product.category || p.brand === product.brand))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);

        return recommendations;
    }

    /**
     * Get product availability information
     * @param productId Product ID
     * @returns Promise with availability info or null if not found
     */
    async getProductAvailability(productId: string): Promise<ProductAvailability | null> {
        const product = await this.getProductById(productId);
        if (!product) {
            return null;
        }

        const availability: ProductAvailability = {
            productId: product.id,
            inStock: product.inStock,
            stockQuantity: product.stockQuantity,
            availability: product.inStock
                ? product.stockQuantity > 10
                    ? 'in_stock'
                    : 'limited_stock'
                : 'out_of_stock',
            lastUpdated: new Date().toISOString(),
        };

        return availability;
    }

    /**
     * Get popular products with optional category filter
     * @param category Optional category filter
     * @param limit Number of products to return
     * @param minRating Minimum rating threshold
     * @returns Promise with popular products
     */
    async getPopularProducts(category?: string, limit = 10, minRating = 4.0): Promise<Product[]> {
        let popularProducts = this.products
            .filter((p) => p.rating >= minRating)
            .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);

        if (category) {
            popularProducts = popularProducts.filter((p) => p.category === category || p.subcategory === category);
        }

        return popularProducts.slice(0, limit);
    }
}
