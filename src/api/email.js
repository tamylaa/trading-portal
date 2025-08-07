/**
 * Email Service API
 * 
 * This module handles direct communication with the email service
 * for frontend-initiated email operations like dashboard notifications,
 * contact forms, and user-initiated email campaigns.
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
    console.error('Email Service Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Email Service API
 */
export const emailApi = {
  /**
   * Check if the email service is healthy
   * @returns {Promise<{success: boolean, status: string, message: string}>}
   */
  checkHealth: async () => {
    try {
      if (!process.env.REACT_APP_EMAIL_SERVICE_ENABLED) {
        return {
          success: false,
          status: 'disabled',
          message: 'Email service is disabled in configuration'
        };
      }

      const response = await emailClient.get('/health', {
        timeout: 5000, // Shorter timeout for health checks
      });

      return {
        success: true,
        status: response.data.status || 'ok',
        message: 'Email service is healthy',
        version: response.data.version,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.message || 'Email service is not available'
      };
    }
  },

  /**
   * Send a contact form email
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Sender's name
   * @param {string} contactData.email - Sender's email
   * @param {string} contactData.subject - Email subject
   * @param {string} contactData.message - Email message
   * @returns {Promise<{success: boolean, message: string}>}
   */
  sendContactEmail: async (contactData) => {
    try {
      const response = await emailClient.post('/send/contact', {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject || 'Contact Form Submission',
        message: contactData.message,
        source: 'trading-portal-contact-form'
      });

      return {
        success: true,
        message: 'Contact email sent successfully',
        emailId: response.data.emailId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send contact email'
      };
    }
  },

  /**
   * Send a notification email to user
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.to - Recipient email
   * @param {string} notificationData.subject - Email subject
   * @param {string} notificationData.template - Email template name
   * @param {Object} notificationData.data - Template data
   * @returns {Promise<{success: boolean, message: string}>}
   */
  sendNotification: async (notificationData) => {
    try {
      const response = await emailClient.post('/send/notification', {
        to: notificationData.to,
        subject: notificationData.subject,
        template: notificationData.template,
        data: notificationData.data,
        source: 'trading-portal-dashboard'
      });

      return {
        success: true,
        message: 'Notification sent successfully',
        emailId: response.data.emailId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send notification'
      };
    }
  },

  /**
   * Subscribe user to newsletter
   * @param {Object} subscriptionData - Subscription data
   * @param {string} subscriptionData.email - User email
   * @param {string} subscriptionData.name - User name (optional)
   * @param {Array} subscriptionData.lists - List IDs to subscribe to
   * @returns {Promise<{success: boolean, message: string}>}
   */
  subscribeNewsletter: async (subscriptionData) => {
    try {
      const response = await emailClient.post('/subscribe', {
        email: subscriptionData.email,
        name: subscriptionData.name,
        lists: subscriptionData.lists || ['general'],
        source: 'trading-portal'
      });

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriptionId: response.data.subscriptionId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to subscribe to newsletter'
      };
    }
  },

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
  },

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

export default emailApi;
