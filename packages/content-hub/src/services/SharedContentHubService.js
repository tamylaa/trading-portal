/**
 * Content Hub Service Configuration
 * 
 * Migrated from custom EnhancedServiceAdapter to shared ApiClient
 * and from ContentHubEventManager to shared EventBus
 */

import { ApiClient } from '@tamyla/shared/api';
import { EventBus } from '@tamyla/shared/events';
// Shared exports changed name to ConfigurationManager; alias for compatibility
import { ConfigurationManager as ConfigManager } from '@tamyla/shared/config';
import { AuthService } from '@tamyla/shared/auth';
import { ErrorHandler, Logger } from '@tamyla/shared/utils';

// Content Hub specific configuration extending shared defaults
const CONTENT_HUB_CONFIG = {
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    enableCircuitBreaker: true,
    enableCaching: true
  },
  
  auth: {
    tokenStorage: 'localStorage',
    autoRefresh: true,
    refreshThreshold: 300 // 5 minutes
  },
  
  content: {
    search: {
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      fallbackEnabled: true,
      maxResults: 100
    },
    upload: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      chunkSize: 1024 * 1024, // 1MB chunks
      enableProgress: true,
      allowedTypes: ['image/*', 'application/pdf', 'text/*', 'video/*']
    }
  },
  
  events: {
    maxHistorySize: 1000,
    enableMiddleware: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
};

/**
 * Shared-based Content Hub Service
 * Replaces EnhancedServiceAdapter with shared infrastructure
 */
export class ContentHubService {
  constructor(config = {}) {
    // Use shared configuration manager
    this.config = new ConfigManager({ ...CONTENT_HUB_CONFIG, ...config });
    
    // Use shared event bus instead of custom ContentHubEventManager
    this.eventBus = new EventBus();
    
    // Use shared API client instead of custom HTTP implementation
    this.apiClient = new ApiClient(this.config, {
      retries: this.config.get('api.retries'),
      timeout: this.config.get('api.timeout'),
      circuitBreaker: this.config.get('api.enableCircuitBreaker'),
      caching: this.config.get('api.enableCaching')
    });
    
    // Use shared auth service
    this.authService = new AuthService(this.config);
    
    // Use shared utilities
    this.errorHandler = new ErrorHandler(this.config);
    this.logger = new Logger('ContentHubService');
    
    this.setupApiInterceptors();
    this.setupEventMiddleware();
    
    if (this.config.get('events.debugMode')) {
      this.logger.info('ContentHubService initialized with shared infrastructure', {
        baseURL: this.config.get('api.baseURL'),
        config: this.config.getAll()
      });
    }
  }

  setupApiInterceptors() {
    // Request interceptor - add authentication and content headers
    this.apiClient.addRequestInterceptor((config) => {
      const token = this.authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      config.headers['X-Content-Domain'] = 'CONTENT_HUB';
      config.headers['X-Request-ID'] = crypto.randomUUID();
      
      return config;
    });

    // Response interceptor - handle content-specific responses
    this.apiClient.addResponseInterceptor(
      (response) => {
        // Transform search results if needed
        if (response.data?.results) {
          response.data.results = this.transformSearchResults(response.data.results);
        }
        return response;
      },
      (error) => {
        const handledError = this.errorHandler.handle(error);
        this.eventBus.emit('api:error', { error: handledError });
        return Promise.reject(handledError);
      }
    );
  }

  setupEventMiddleware() {
    // Add logging middleware to event bus
    this.eventBus.addMiddleware((event, next) => {
      if (this.config.get('events.debugMode')) {
        this.logger.debug('Event published', {
          type: event.type,
          data: event.data,
          timestamp: event.timestamp
        });
      }
      return next();
    });

    // Add performance monitoring middleware
    this.eventBus.addMiddleware((event, next) => {
      const startTime = performance.now();
      const result = next();
      const duration = performance.now() - startTime;
      
      if (duration > 100) { // Log slow events
        this.logger.warn('Slow event processing', {
          type: event.type,
          duration,
          data: event.data
        });
      }
      
      return result;
    });
  }

  transformSearchResults(results) {
    return results.map(result => ({
      ...result,
      // Add content hub specific transformations
      displayUrl: result.url ? `/content/view/${encodeURIComponent(result.url)}` : null,
      thumbnailUrl: result.thumbnail ? `/api/thumbnails/${result.thumbnail}` : null,
      formattedDate: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : null
    }));
  }

  // SEARCH SERVICE - Using shared ApiClient
  async search(query, filters = {}) {
    this.eventBus.emit('search:started', { query, filters, timestamp: new Date() });
    
    try {
      // Check cache first (if enabled)
      const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
      
      const response = await this.apiClient.post('/api/content/search', {
        query,
        filters,
        maxResults: this.config.get('content.search.maxResults')
      });

      const results = response.data;
      
      this.eventBus.emit('search:completed', {
        query,
        filters,
        results,
        resultCount: results.length,
        timestamp: new Date()
      });

      return results;
      
    } catch (error) {
      this.eventBus.emit('search:failed', {
        query,
        filters,
        error: error.message,
        timestamp: new Date()
      });

      // Try fallback if enabled
      if (this.config.get('content.search.fallbackEnabled')) {
        try {
          const fallbackResults = await this.searchFallback(query, filters);
          this.eventBus.emit('search:fallback_used', {
            query,
            filters,
            fallbackResults,
            originalError: error.message,
            timestamp: new Date()
          });
          return fallbackResults;
        } catch (fallbackError) {
          this.logger.error('Fallback search also failed', fallbackError);
        }
      }

      throw error;
    }
  }

  async searchFallback(query, filters) {
    // Simple fallback implementation
    const response = await this.apiClient.get('/api/content/simple-search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  // UPLOAD SERVICE - Using shared ApiClient
  async upload(files, options = {}) {
    this.eventBus.emit('upload:started', {
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      timestamp: new Date()
    });

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        // Validate file size
        const maxSize = this.config.get('content.upload.maxFileSize');
        if (file.size > maxSize) {
          throw ErrorHandler.createError(`File ${file.name} exceeds maximum size of ${maxSize} bytes`, 'FILE_SIZE_EXCEEDED');
        }
        
        formData.append(`files`, file);
      });

      // Add metadata
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      const response = await this.apiClient.post('/api/content/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          this.eventBus.emit('upload:progress', {
            progress,
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            timestamp: new Date()
          });
        }
      });

      const results = response.data;

      this.eventBus.emit('upload:completed', {
        fileCount: files.length,
        results,
        timestamp: new Date()
      });

      return results;

    } catch (error) {
      this.eventBus.emit('upload:failed', {
        fileCount: files.length,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  // HEALTH CHECK - Using shared ApiClient
  async checkHealth() {
    try {
      const response = await this.apiClient.get('/api/health');
      const health = {
        status: response.data.status,
        timestamp: new Date(),
        responseTime: response.data.responseTime,
        version: response.data.version
      };

      this.eventBus.emit('service:health_check', health);
      return health;
      
    } catch (error) {
      const health = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };

      this.eventBus.emit('service:health_check', health);
      throw error;
    }
  }

  // EVENT BUS ACCESS - Expose shared EventBus
  on(eventType, handler, options = {}) {
    return this.eventBus.on(eventType, handler, options);
  }

  once(eventType, handler, options = {}) {
    return this.eventBus.once(eventType, handler, options);
  }

  off(eventType, listenerId) {
    return this.eventBus.off(eventType, listenerId);
  }

  emit(eventType, data) {
    return this.eventBus.emit(eventType, data);
  }

  getEventHistory() {
    return this.eventBus.getEventHistory();
  }

  // AUTHENTICATION - Expose shared AuthService
  getToken() {
    return this.authService.getToken();
  }

  setToken(token) {
    this.authService.setToken(token);
  }

  getUser() {
    return this.authService.getUser();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
  }
}

// Backwards-compatible singleton instance used by legacy components
export const contentService = new ContentHubService();
export default contentService;

// Factory function for easy instantiation
export const createContentHubService = (config = {}) => {
  return new ContentHubService(config);
};