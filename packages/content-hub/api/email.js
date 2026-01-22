/**
 * Content Hub Email Service API
 *
 * This module handles email operations related to content sharing.
 * Campaign functionality belongs in the Campaign Hub.
 * 
 * MIGRATED: Now uses @tamyla/shared infrastructure instead of custom axios
 */

import { ApiClient, AuthService, ConfigManager, Logger } from '@tamyla/shared';
import API_CONFIG from '../config/api';

// ✅ FIXED: Use shared ApiClient instead of custom axios
const config = new ConfigManager({
  api: {
    baseURL: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://auto_email.tamyla.com',
    timeout: API_CONFIG.TIMEOUTS?.DEFAULT || 15000,
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

const authService = new AuthService(config);
const logger = new Logger('EmailAPI');
const emailClient = new ApiClient(config);

// ✅ FIXED: Use shared AuthService instead of direct localStorage
emailClient.addRequestInterceptor((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

emailClient.addResponseInterceptor(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
emailClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    logger.error('Email Service Error', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Content Hub Email Service API
 */
export const emailApi = {
  /**
   * Send a content sharing email with file attachments
   * @param {Object} sharingData - Content sharing data
   * @param {string} sharingData.to - Recipient email
   * @param {string} sharingData.subject - Email subject
   * @param {string} sharingData.message - Personal message
   * @param {Array} sharingData.files - Array of file objects
   * @param {string} sharingData.senderName - Sender's name
   * @param {string} sharingData.senderEmail - Sender's email
   * @returns {Promise<{success: boolean, message: string}>}
   */
  sendContentShare: async (sharingData) => {
    try {
      const response = await emailClient.post('/send/content-share', {
        to: sharingData.to,
        subject: sharingData.subject,
        message: sharingData.message,
        files: sharingData.files,
        senderName: sharingData.senderName,
        senderEmail: sharingData.senderEmail,
        source: 'trading-portal-content-share'
      });

      return {
        success: true,
        message: 'Content sharing email sent successfully',
        emailId: response.data.emailId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send content sharing email'
      };
    }
  }
};

export default emailApi;