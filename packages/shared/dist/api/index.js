/**
 * Shared API Utilities
 *
 * Provides consistent API client functionality with interceptors, retry logic, and error handling.
 */

import axios from 'axios';
import { getConfig } from '../config';
import { authService } from '../auth';
import { eventBus, EVENT_TYPES } from '../events';
export class ApiClient {
  constructor(configManager = null, options = {}) {
    this.configManager = configManager;
    this.options = options;
    this.client = this.createClient();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.setupInterceptors();
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.configManager ? this.configManager.getConfiguration() : getConfig();
  }

  /**
   * Create axios client instance
   */
  createClient() {
    const config = this.getConfig();
    const clientConfig = {
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        ...config.api.headers,
        ...this.options.headers
      },
      ...this.options.axiosConfig
    };
    return axios.create(clientConfig);
  }

  /**
   * Setup default interceptors
   */
  setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(config => {
      // Add auth header if available
      const authHeader = authService.getAuthHeader();
      if (authHeader.Authorization) {
        config.headers = {
          ...config.headers,
          ...authHeader
        };
      }

      // Emit request event
      eventBus.emit(EVENT_TYPES.DATA_LOAD, {
        url: config.url,
        method: config.method
      }, {
        source: 'api-client'
      });
      return config;
    }, error => {
      eventBus.emit(EVENT_TYPES.HUB_ERROR, {
        type: 'request',
        error: error.message
      }, {
        source: 'api-client'
      });
      return Promise.reject(error);
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(response => {
      return response;
    }, async error => {
      const config = this.getConfig();

      // Handle token refresh on 401
      if (error.response?.status === 401 && config.auth.autoRefresh) {
        try {
          await authService.refreshAccessToken();
          // Retry the original request
          const authHeader = authService.getAuthHeader();
          error.config.headers = {
            ...error.config.headers,
            ...authHeader
          };
          return this.client.request(error.config);
        } catch (refreshError) {
          // If refresh fails, emit auth error
          eventBus.emit(EVENT_TYPES.AUTH_ERROR, {
            error: 'Token refresh failed'
          }, {
            source: 'api-client'
          });
        }
      }

      // Handle retries
      if (config.api.retries > 0 && !error.config._retry) {
        error.config._retry = true;
        await this.delay(config.api.retryDelay);
        return this.client.request(error.config);
      }

      // Emit error event
      eventBus.emit(EVENT_TYPES.HUB_ERROR, {
        type: 'response',
        status: error.response?.status,
        url: error.config?.url,
        error: error.message
      }, {
        source: 'api-client'
      });
      return Promise.reject(error);
    });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
    return this.client.interceptors.request.use(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
    return this.client.interceptors.response.use(interceptor);
  }

  /**
   * Remove interceptor
   */
  removeInterceptor(type, interceptorId) {
    if (type === 'request') {
      this.client.interceptors.request.eject(interceptorId);
    } else if (type === 'response') {
      this.client.interceptors.response.eject(interceptorId);
    }
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  /**
   * Upload file
   */
  async upload(url, file, onProgress = null, config = {}) {
    const formData = new FormData();
    formData.append('file', file);
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      onUploadProgress: onProgress
    };
    return this.client.post(url, formData, uploadConfig);
  }

  /**
   * Download file
   */
  async download(url, filename = null, config = {}) {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob'
    });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || this.getFilenameFromResponse(response);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return response;
  }

  /**
   * Get filename from response headers
   */
  getFilenameFromResponse(response) {
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return 'download';
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get underlying axios client
   */
  getClient() {
    return this.client;
  }
}

// Create shared API client instance
export const apiClient = new ApiClient();

// Export convenience functions
export const get = (url, config) => apiClient.get(url, config);
export const post = (url, data, config) => apiClient.post(url, data, config);
export const put = (url, data, config) => apiClient.put(url, data, config);
export const patch = (url, data, config) => apiClient.patch(url, data, config);
export const del = (url, config) => apiClient.delete(url, config);
export const upload = (url, file, onProgress, config) => apiClient.upload(url, file, onProgress, config);
export const download = (url, filename, config) => apiClient.download(url, filename, config);

/**
 * Create hub-specific API client
 */
export const createHubApiClient = (configManager, options = {}) => {
  return new ApiClient(configManager, options);
};

/**
 * API Response utilities
 */
export const apiUtils = {
  /**
   * Check if response is successful
   */
  isSuccess: response => {
    return response.status >= 200 && response.status < 300;
  },
  /**
   * Extract data from response
   */
  getData: response => {
    return response.data;
  },
  /**
   * Handle API errors consistently
   */
  handleError: error => {
    if (error.response) {
      // Server responded with error status
      const {
        status,
        data
      } = error.response;
      return {
        status,
        message: data.message || `Request failed with status ${status}`,
        details: data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error - no response received',
        details: error.request
      };
    } else {
      // Something else happened
      return {
        status: -1,
        message: error.message || 'Unknown error occurred',
        details: error
      };
    }
  },
  /**
   * Create standardized API response
   */
  createResponse: (success, data = null, error = null) => {
    return {
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    };
  }
};