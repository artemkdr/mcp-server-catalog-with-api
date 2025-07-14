export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  facets?: {
    categories?: { value: string; count: number }[];
    brands?: { value: string; count: number }[];
  };
  filters?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
}

export class CatalogApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(`API Error (${response.status}): ${errorData.error}`);
      }
      
      return await response.json() as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from ${url}: ${error.message}`);
      }
      throw new Error(`Failed to fetch from ${url}: Unknown error`);
    }
  }

  async searchProducts(params: {
    query?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params.query) {
      searchParams.append('q', params.query);
    }
    if (params.category) {
      searchParams.append('category', params.category);
    }
    if (params.brand) {
      searchParams.append('brand', params.brand);
    }
    if (params.minPrice !== undefined) {
      searchParams.append('min_price', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      searchParams.append('max_price', params.maxPrice.toString());
    }
    if (params.inStockOnly) {
      searchParams.append('in_stock', 'true');
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      searchParams.append('limit', params.pageSize.toString());
    }
    if (params.sortBy) {
      searchParams.append('sort_by', params.sortBy);
    }
    if (params.sortOrder) {
      searchParams.append('sort_order', params.sortOrder);
    }

    const endpoint = params.query 
      ? `/api/v1/products/search?${searchParams.toString()}`
      : `/api/v1/products?${searchParams.toString()}`;
    
    return this.request(endpoint);
  }

  async getProductDetails(productId: string) {
    return this.request(`/api/v1/products/${productId}`);
  }

  async getProductRecommendations(productId: string, limit = 5) {
    return this.request(`/api/v1/products/${productId}/recommendations?limit=${limit}`);
  }

  async checkProductAvailability(productId: string) {
    return this.request(`/api/v1/products/${productId}/availability`);
  }

  async getCategories(parentId?: string, includeProductCount = true) {
    const params = new URLSearchParams();
    if (parentId) {
      params.append('parent_id', parentId);
    }
    if (!includeProductCount) {
      params.append('include_product_count', 'false');
    }
    
    return this.request(`/api/v1/categories?${params.toString()}`);
  }

  async getCategoryDetails(categoryId: string) {
    return this.request(`/api/v1/categories/${categoryId}`);
  }

  async getCategoryProducts(categoryId: string, page = 1, limit = 10) {
    return this.request(`/api/v1/categories/${categoryId}/products?page=${page}&limit=${limit}`);
  }

  async getPopularProducts(category?: string, limit = 10, minRating = 4.0) {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    params.append('limit', limit.toString());
    params.append('min_rating', minRating.toString());
    
    return this.request(`/api/v1/products/popular?${params.toString()}`);
  }

  async getCategoryPriceRange(categoryId: string) {
    return this.request(`/api/v1/categories/${categoryId}/price-range`);
  }

  async getGeneralRecommendations(category?: string, limit = 5) {
    if (category) {
      const params = new URLSearchParams();
      params.append('category', category);
      params.append('limit', limit.toString());
      return this.request(`/api/v1/products?${params.toString()}&sort_by=rating&sort_order=desc`);
    }
    
    return this.request(`/api/v1/products/popular?limit=${limit}`);
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
