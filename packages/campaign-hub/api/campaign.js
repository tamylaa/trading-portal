/**
 * Campaign Hub Email Service API
 *
 * This module handles email campaign operations.
 * Content sharing functionality belongs in the Content Hub.
 */

import axios from 'axios';
import API_CONFIG from '../config/api';

// Create axios instance for email service
const emailClient = axios.create({
  baseURL: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://auto_email.tamyla.com',
  timeout: API_CONFIG.TIMEOUTS?.DEFAULT || 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
emailClient.interceptors.request.use(
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
emailClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Campaign Email Service Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Campaign Hub Email Service API
 */
export const campaignApi = {
  /**
   * Send bulk campaign email
   * @param {Object} campaignData - Campaign data
   * @param {Array} campaignData.recipients - Array of recipient emails
   * @param {string} campaignData.subject - Email subject
   * @param {string} campaignData.template - Template name
   * @param {Object} campaignData.data - Template data
   * @param {Array} campaignData.attachments - File attachments
   * @returns {Promise<{success: boolean, message: string, results: Array}>}
   */
  sendBulkCampaign: async (campaignData) => {
    try {
      const response = await emailClient.post('/send/bulk-campaign', {
        recipients: campaignData.recipients,
        subject: campaignData.subject,
        template: campaignData.template || 'campaign',
        data: campaignData.data,
        attachments: campaignData.attachments || [],
        source: 'trading-portal-campaign'
      });

      return {
        success: true,
        message: 'Bulk campaign sent successfully',
        campaignId: response.data.campaignId,
        results: response.data.results
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send bulk campaign'
      };
    }
  },

  /**
   * Get email templates available for user
   * @returns {Promise<{success: boolean, templates: Array}>}
   */
  getTemplates: async () => {
    try {
      const response = await emailClient.get('/templates');

      return {
        success: true,
        templates: response.data.templates || []
      };
    } catch (error) {
      return {
        success: false,
        templates: [],
        message: error.response?.data?.message || 'Failed to fetch email templates'
      };
    }
  }
};

export default campaignApi;