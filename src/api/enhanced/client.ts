// Enhanced API Client
// Modern API layer with TypeScript, error handling, and integration with enhanced state
// Progressive enhancement - works alongside existing API calls

import { FEATURE_FLAGS } from '../../config/features';

// Enhanced API response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Enhanced API configuration
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCache: boolean;
  enableOptimisticUpdates: boolean;
}

const defaultConfig: ApiConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  enableCache: true,
  enableOptimisticUpdates: true,
};

// Enhanced API client class
export class EnhancedApiClient {
  private config: ApiConfig;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private requestId = 0;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Generate unique request ID for tracking
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestId}`;
  }

  // Cache management
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private getFromCache(key: string): any | null {
    if (!this.config.enableCache) return null;
    
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    if (!this.config.enableCache) return;
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  // Enhanced fetch with retries and error handling
  private async enhancedFetch(
    url: string, 
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<Response> {
    const requestId = this.generateRequestId();
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.config.retries && error.name !== 'AbortError') {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        return this.enhancedFetch(url, options, attempt + 1);
      }
      
      throw error;
    }
  }

  // Generic API method
  async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache for GET requests
    if ((!options.method || options.method === 'GET')) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.enhancedFetch(url, options);
      const data = await response.json();
      
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers.get('X-Request-ID') || undefined,
      };

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        this.setCache(cacheKey, apiResponse);
      }

      return apiResponse;
    } catch (error) {
      const apiError: ApiError = {
        message: error.message || 'Unknown API error',
        status: error.status || 500,
        timestamp: new Date().toISOString(),
      };
      
      throw apiError;
    }
  }

  // Convenience methods
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  removeCacheEntry(url: string, options?: RequestInit): void {
    const key = this.getCacheKey(url, options);
    this.cache.delete(key);
  }
}

// Singleton instance
export const enhancedApiClient = new EnhancedApiClient();

// Feature flag aware API client
export const getApiClient = () => {
  if (FEATURE_FLAGS.useEnhancedServices) {
    return enhancedApiClient;
  }
  
  // Return legacy API client wrapper
  return {
    get: async (url: string) => {
      const response = await fetch(url);
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
    post: async (url: string, data: any) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      return { data: responseData, status: response.status, timestamp: new Date().toISOString() };
    },
    put: async (url: string, data: any) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      return { data: responseData, status: response.status, timestamp: new Date().toISOString() };
    },
    patch: async (url: string, data: any) => {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      return { data: responseData, status: response.status, timestamp: new Date().toISOString() };
    },
    delete: async (url: string) => {
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
  };
};
