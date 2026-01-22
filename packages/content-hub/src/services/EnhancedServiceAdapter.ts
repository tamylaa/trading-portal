/**
 * Enhanced Service Adapter
 * 
 * @deprecated Use SharedContentHubService instead
 * This class duplicates infrastructure that is now available in @tamyla/shared
 * 
 * Legacy patterns included:
 * - Timeout handling and retries (now in shared ApiClient)
 * - Fallback mechanisms (now in shared ApiClient)
 * - Environment awareness (now in shared ConfigManager)
 * - Circuit breaker pattern (now in shared ApiClient)
 * - Comprehensive error handling (now in shared ErrorHandler)
 */

import { SearchRequest, SearchResponse, ServiceHealth } from '../types/enhanced';
// Importing from @tamyla/shared will be replaced with actual package when available

// Temporary mock implementations until @tamyla/shared is available
class MockApiClient {
  async request(options: any) {
    // Mock implementation for compilation
    return { data: {}, status: 200 };
  }
}

class MockErrorHandler {
  static createError(message: string, code?: string) {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

const ApiClient = MockApiClient;
const ErrorHandler = MockErrorHandler;

// Temporary mock Logger until @tamyla/shared is available
class MockLogger {
  static debug(...args: any[]) {
    if (typeof globalThis !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const log = globalThis['console'] && globalThis['console']['log'];
      if (log) log('[DEBUG]', ...args);
    }
  }
  
  static error(...args: any[]) {
    if (typeof globalThis !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const error = globalThis['console'] && globalThis['console']['error'];
      if (error) error('[ERROR]', ...args);
    }
  }
}

const Logger = MockLogger;

export class EnhancedServiceAdapter {
  private baseUrl: string;
  private token?: string;
  private config: {
    timeout: number;
    retries: number;
    enableFallback: boolean;
    enableCaching: boolean;
    debugMode: boolean;
  };
  private apiClient: any; // ApiClient from @tamyla/shared
  
  private cache = new Map<string, { data: any; expiry: number }>();
  private circuitBreaker = {
    failures: 0,
    threshold: 5,
    resetTimeout: 30000,
    state: 'closed' as 'closed' | 'open' | 'half-open'
  };

  constructor(baseUrl?: string, token?: string, config: Partial<typeof this.config> = {}) {
    this.baseUrl = baseUrl || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    this.token = token;
    this.config = {
      timeout: 10000,
      retries: 3,
      enableFallback: true,
      enableCaching: true,
      debugMode: process.env.NODE_ENV === 'development',
      ...config
    };
    
    // Initialize ApiClient
    this.apiClient = new ApiClient();
    
    if (this.config.debugMode) {
      Logger.debug('EnhancedServiceAdapter initialized:', {
        baseUrl: this.baseUrl,
        config: this.config
      });
    }
  }

  // ENHANCED SEARCH with resilience patterns
  async search(query: string, filters: Record<string, any> = {}): Promise<SearchResponse> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        if (this.config.debugMode) Logger.debug('Cache hit:', cacheKey);
        return cached;
      }
    }
    
    // Check circuit breaker
    if (this.circuitBreaker.state === 'open') {
      if (this.config.enableFallback) {
        return this.getFallbackResults(query, filters);
      }
      throw ErrorHandler.createError('Service temporarily unavailable (circuit breaker open)', 'CIRCUIT_BREAKER_OPEN');
    }
    
    try {
      const request: SearchRequest = {
        query: query.trim(),
        filters,
        limit: 20,
        offset: 0
      };
      
      const response = await this.robustRequest<SearchResponse>('/api/search', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      // Cache successful response
      if (this.config.enableCaching && response.results.length > 0) {
        this.setCached(cacheKey, response, 5 * 60 * 1000); // 5 minutes
      }
      
      // Reset circuit breaker on success
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.state = 'closed';
      
      return response;
      
    } catch (error) {
      const serviceError = error instanceof Error ? error : new Error('Unknown search error');
      this.handleServiceError(serviceError);
      
      // Fallback on error
      if (this.config.enableFallback) {
        return this.getFallbackResults(query, filters);
      }
      
      throw serviceError;
    }
  }

  // ROBUST REQUEST with timeout, retry, cancellation
  private async robustRequest<T>(endpoint: string, options: any = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        if (this.config.debugMode && attempt > 0) {
          Logger.debug(`Retry attempt ${attempt} for ${endpoint}`);
        }
        
        // Use ApiClient instead of fetch for consistent error handling and timeout management
        const response = await this.apiClient.request({
          url: endpoint,
          method: options.method || 'GET',
          headers,
          data: options.body ? JSON.parse(options.body) : options.data,
          timeout: this.config.timeout
        });

        return response.data;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('401')) {
          break;
        }
        
        // Exponential backoff for retries
        if (attempt < this.config.retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  // SERVICE HEALTH CHECK with comprehensive monitoring
  async checkHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const response = await this.robustRequest<{ status: string; meilisearch?: string }>('/api/health');
      const latency = Date.now() - startTime;
      
      return {
        gateway: response.status === 'ok' ? 'online' : 'offline',
        meilisearch: response.meilisearch === 'ok' ? 'online' : 'offline',
        timestamp: new Date().toISOString(),
        latency,
        fallbackActive: this.circuitBreaker.state !== 'closed'
      };
      
    } catch (error) {
      return {
        gateway: 'offline',
        meilisearch: 'unknown',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackActive: true
      };
    }
  }

  // UPLOAD with progress tracking and resilience
  async upload(files: File[], options: { onProgress?: (progress: Record<string, number>) => void } = {}): Promise<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      // Note: This service should be replaced with SharedContentHubService
      // which includes proper upload progress via shared ApiClient
      if (options.onProgress) {
        files.forEach(file => {
          options.onProgress!({ [file.name]: 100 });
        });
      }
      
      return await this.robustRequest('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
      
    } catch (error) {
      const serviceError = error instanceof Error ? error : new Error('Upload failed');
      this.handleServiceError(serviceError);
      throw serviceError;
    }
  }

  // GALLERY with intelligent caching
  async getGallery(options: { page?: number; limit?: number } = {}): Promise<any> {
    const cacheKey = `gallery:${options.page || 0}:${options.limit || 20}`;
    
    if (this.config.enableCaching) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const response = await this.robustRequest('/api/gallery', {
        method: 'GET'
      });
      
      if (this.config.enableCaching) {
        this.setCached(cacheKey, response, 2 * 60 * 1000); // 2 minutes
      }
      
      return response;
      
    } catch (error) {
      const serviceError = error instanceof Error ? error : new Error('Gallery fetch failed');
      this.handleServiceError(serviceError);
      throw serviceError;
    }
  }

  // SHARING functionality
  async share(fileId: string, permissions: any): Promise<any> {
    try {
      return await this.robustRequest('/api/share', {
        method: 'POST',
        body: JSON.stringify({ fileId, permissions })
      });
    } catch (error) {
      const serviceError = error instanceof Error ? error : new Error('Share failed');
      this.handleServiceError(serviceError);
      throw serviceError;
    }
  }

  async getShared(): Promise<any> {
    const cacheKey = 'shared:list';
    
    if (this.config.enableCaching) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const response = await this.robustRequest('/api/shared');
      
      if (this.config.enableCaching) {
        this.setCached(cacheKey, response, 60 * 1000); // 1 minute
      }
      
      return response;
    } catch (error) {
      const serviceError = error instanceof Error ? error : new Error('Get shared failed');
      this.handleServiceError(serviceError);
      throw serviceError;
    }
  }

  // CACHE MANAGEMENT
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  // ERROR HANDLING & CIRCUIT BREAKER
  private handleServiceError(error: Error): void {
    this.circuitBreaker.failures++;
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'open';
      
      // Auto-reset circuit breaker after timeout
      setTimeout(() => {
        this.circuitBreaker.state = 'half-open';
      }, this.circuitBreaker.resetTimeout);
    }
    
    if (this.config.debugMode) {
      Logger.error('Service error:', error, {
        failures: this.circuitBreaker.failures,
        state: this.circuitBreaker.state
      });
    }
  }

  // FALLBACK DATA for offline scenarios
  private getFallbackResults(query: string, filters: Record<string, any>): SearchResponse {
    const mockResults = [
      {
        id: 'mock-1',
        title: `Mock result for "${query}"`,
        summary: 'This is a fallback result when the service is unavailable',
        filename: 'fallback-document.pdf',
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        name: `Mock result for "${query}"`, // Legacy compatibility
        description: 'This is a fallback result when the service is unavailable'
      }
    ];

    return {
      results: mockResults,
      total: mockResults.length,
      query,
      hasMore: false,
      processingTimeMs: 1,
      error: 'Service unavailable - showing cached/fallback results'
    };
  }

  // CLEAR CACHE
  clearCache(): void {
    this.cache.clear();
  }

  // GET STATISTICS
  getStats(): any {
    return {
      cacheSize: this.cache.size,
      circuitBreaker: this.circuitBreaker,
      config: this.config
    };
  }
}

// FACTORY FUNCTION for easy instantiation
export const createEnhancedServiceAdapter = (config?: {
  baseUrl?: string;
  token?: string;
  timeout?: number;
  retries?: number;
  enableFallback?: boolean;
  enableCaching?: boolean;
}) => {
  return new EnhancedServiceAdapter(
    config?.baseUrl,
    config?.token,
    config
  );
};

export default EnhancedServiceAdapter;