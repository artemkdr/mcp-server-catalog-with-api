// Types for API client
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

export interface Category {
    id: string;
    name: string;
    description: string;
    parentId?: string;
    subcategories: Category[];
    productCount: number;
}

export interface ProductAvailability {
    inStock: boolean;
    stockQuantity: number;
    productId: string;
    availability: string; // e.g., "in stock", "out of stock", "pre-order"
    lastUpdated: string; // ISO date string
}

export interface SearchResult {
    products: Product[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    facets: {
        categories: { name: string; count: number }[];
        brands: { name: string; count: number }[];
        priceRanges: { min: number; max: number; count: number }[];
    };
}
