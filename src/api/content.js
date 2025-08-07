/**
 * Content Service API
 * 
 * This module handles direct communication with the content service
 * for file management, sharing, and public access operations.
 */

import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance for content service
const contentClient = axios.create({
  baseURL: process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com',
  timeout: API_CONFIG.TIMEOUTS?.DEFAULT || 30000, // Longer timeout for file operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
contentClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
contentClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Content Service Error:', {
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
   * Get user's files
   * @returns {Promise<{success: boolean, files: Array}>}
   */
  getUserFiles: async () => {
    try {
      const response = await contentClient.get('/files');
      return {
        success: true,
        files: response.data.files || []
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        message: error.response?.data?.message || 'Failed to fetch user files'
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
      throw new Error(error.response?.data?.message || 'Failed to download file');
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
