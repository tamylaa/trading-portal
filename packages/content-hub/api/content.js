/**
 * Content Service API
 *
 * This module handles direct communication with the content service
 * for file management, sharing, and public access operations.
 * 
 * MIGRATED: Now uses @tamyla/shared infrastructure instead of custom axios
 */

import { ApiClient, AuthService, ConfigManager, Logger, ErrorHandler } from '@tamyla/shared';
import API_CONFIG from '../config/api';

// ✅ FIXED: Use shared ApiClient instead of custom axios
const config = new ConfigManager({
  api: {
    baseURL: process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com',
    timeout: API_CONFIG.TIMEOUTS?.DEFAULT || 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

const authService = new AuthService(config);
const logger = new Logger('ContentAPI');
const contentClient = new ApiClient(config);

// ✅ FIXED: Use shared infrastructure for auth and logging
contentClient.addRequestInterceptor((config) => {
  // Use shared AuthService instead of direct localStorage access
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ FIXED: Use shared infrastructure for error handling
contentClient.addResponseInterceptor(
  (response) => response,
  (error) => {
    // Using shared Logger for error handling
    logger.error('Content Service Error', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Content Service API
 */
export const contentApi = {
  /**
   * Check if the content service is healthy
   * @returns {Promise<{success: boolean, status: string}>}
   */
  checkHealth: async () => {
    try {
      const response = await contentClient.get('/health');
      return {
        success: true,
        status: response.data.status || 'ok',
        message: 'Content service is healthy'
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.message || 'Content service is not available'
      };
    }
  },

  /**
   * Upload a file to the content service
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<{success: boolean, file: Object}>}
   */
  uploadFile: async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (options.metadata) {
        Object.keys(options.metadata).forEach(key => {
          formData.append(key, options.metadata[key]);
        });
      }

      const response = await contentClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute for file uploads
      });

      return {
        success: true,
        file: response.data.file,
        access: response.data.access,
        urls: response.data.urls
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      };
    }
  },

  /**
   * Get user's files with enhanced pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20, max: 100)
   * @param {string} options.period - Time period filter ('all', 'today', 'week', 'month')
   * @param {string} options.category - Category filter ('all' or specific category)
   * @param {string} options.search - Search term for filename/category
   * @param {string} options.sort - Sort order ('recent', 'oldest', 'name', 'size')
   * @returns {Promise<{success: boolean, files: Array, pagination: Object}>}
   */
  getUserFiles: async (options = {}) => {
    try {
      const params = new URLSearchParams();

      // Add pagination parameters
      if (options.page) params.set('page', options.page.toString());
      if (options.limit) params.set('limit', Math.min(options.limit, 100).toString());

      // Add filtering parameters
      if (options.period && options.period !== 'all') params.set('period', options.period);
      if (options.category && options.category !== 'all') params.set('category', options.category);
      if (options.search) params.set('search', options.search);
      if (options.sort && options.sort !== 'recent') params.set('sort', options.sort);

      const queryString = params.toString();
      const url = queryString ? `/files?${queryString}` : '/files';

      logger.debug('Fetching user files with enhanced options', { url });

      const response = await contentClient.get(url);

      return {
        success: true,
        files: response.data.files || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: response.data.files?.length || 0,
          hasNext: false,
          hasPrev: false
        },
        sessionCount: response.data.sessionCount || 0,
        historicalCount: response.data.historicalCount || 0,
        // Backward compatibility
        count: response.data.count || response.data.files?.length || 0
      };
    } catch (error) {
      logger.error('getUserFiles error', error);
      return {
        success: false,
        files: [],
        pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrev: false },
        message: error.response?.data?.message || 'Failed to fetch user files'
      };
    }
  },

  /**
   * Get user's recent session uploads (instant feedback)
   * @returns {Promise<{success: boolean, files: Array, count: number}>}
   */
  getSessionFiles: async () => {
    try {
      logger.debug('Fetching session files for instant feedback');

      const response = await contentClient.get('/files/session');

      return {
        success: true,
        files: response.data.files || [],
        count: response.data.count || 0,
        message: response.data.message || 'Session files retrieved successfully'
      };
    } catch (error) {
      logger.error('getSessionFiles error', error);
      return {
        success: false,
        files: [],
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch session files'
      };
    }
  },

  /**
   * Get user's file statistics
   * @returns {Promise<{success: boolean, stats: Object}>}
   */
  getFileStats: async () => {
    try {
      logger.debug('Fetching file statistics');

      const response = await contentClient.get('/files/stats');

      return {
        success: true,
        stats: response.data.stats || {
          sessionUploads: 0,
          totalFiles: 0,
          totalSize: 0,
          categories: {},
          recentActivity: []
        },
        message: response.data.message || 'File statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('getFileStats error', error);
      return {
        success: false,
        stats: {
          sessionUploads: 0,
          totalFiles: 0,
          totalSize: 0,
          categories: {},
          recentActivity: []
        },
        message: error.response?.data?.message || 'Failed to fetch file statistics'
      };
    }
  },

  /**
   * Get public files
   * @returns {Promise<{success: boolean, files: Array}>}
   */
  getPublicFiles: async () => {
    try {
      const response = await contentClient.get('/public');
      return {
        success: true,
        files: response.data.publicFiles || [],
        count: response.data.count || 0
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        message: error.response?.data?.message || 'Failed to fetch public files'
      };
    }
  },

  /**
   * Toggle file public status
   * @param {string} fileId - File ID
   * @param {boolean} isPublic - Whether to make file public
   * @returns {Promise<{success: boolean, message: string}>}
   */
  toggleFilePublic: async (fileId, isPublic) => {
    try {
      const response = await contentClient.put(`/access/${fileId}/public`, {
        isPublic: isPublic
      });

      return {
        success: true,
        message: `File ${isPublic ? 'made public' : 'made private'} successfully`,
        file: response.data.file
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to ${isPublic ? 'publish' : 'unpublish'} file`
      };
    }
  },

  /**
   * Get file access information
   * @param {string} fileId - File ID
   * @returns {Promise<{success: boolean, file: Object}>}
   */
  getFileInfo: async (fileId) => {
    try {
      const response = await contentClient.get(`/access/${fileId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        file: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get file information'
      };
    }
  },

  /**
   * Generate signed URL for file access
   * @param {string} fileId - File ID
   * @param {number} expiresIn - Expiration time in seconds (default: 3600)
   * @returns {Promise<{success: boolean, signedUrl: string}>}
   */
  generateSignedUrl: async (fileId, expiresIn = 3600) => {
    try {
      const response = await contentClient.post(`/access/${fileId}/signed`, {
        expiresIn: expiresIn
      });

      return {
        success: true,
        signedUrl: response.data.signedUrl,
        expiresAt: response.data.expiresAt
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate signed URL'
      };
    }
  },

  /**
   * Download file
   * @param {string} fileId - File ID
   * @param {Object} options - Download options
   * @returns {Promise<Blob>}
   */
  downloadFile: async (fileId, options = {}) => {
    try {
      const response = await contentClient.get(`/access/${fileId}`, {
        responseType: 'blob',
        ...options
      });

      return response.data;
    } catch (error) {
      throw ErrorHandler.createError(error.response?.data?.message || 'Failed to download file');
    }
  },

  /**
   * Make multiple files public for sharing
   * @param {Array} fileIds - Array of file IDs
   * @returns {Promise<{success: boolean, results: Array}>}
   */
  makeFilesPublic: async (fileIds) => {
    try {
      const promises = fileIds.map(fileId =>
        contentApi.toggleFilePublic(fileId, true)
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      return {
        success: successful > 0,
        results: results,
        summary: {
          total: fileIds.length,
          successful: successful,
          failed: failed
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to make files public'
      };
    }
  },

  /**
   * Generate public URLs for files
   * @param {Array} files - Array of file objects
   * @returns {Array} Array of files with public URLs
   */
  generatePublicUrls: (files) => {
    return files.map(file => ({
      ...file,
      publicUrl: `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/access/${file.id}`,
      downloadUrl: `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/download/${file.id}`,
      legacyUrl: `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/api/v1/content/${file.id}`
    }));
  }
};

export default contentApi;