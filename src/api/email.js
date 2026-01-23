/**
 * Email Service API
 *
 * General email service operations (notifications, health checks, subscriptions)
 * Campaign-specific operations are in @tamyla/campaign-hub
 */

import axios from 'axios';

const emailClient = axios.create({
  baseURL: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://auto_email.tamyla.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
emailClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
emailClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Email Service Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export const emailApi = {
  /**
   * Check email service health
   */
  checkHealth: async () => {
    try {
      const response = await emailClient.get('/health');
      return {
        success: true,
        status: response.data.status || 'ok',
        message: 'Email service is healthy'
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
   * Send notification email
   */
  sendNotification: async (notificationData) => {
    try {
      const response = await emailClient.post('/send/notification', notificationData);
      return {
        success: true,
        message: 'Notification sent successfully',
        id: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send notification'
      };
    }
  },

  /**
   * Subscribe to newsletter
   */
  subscribeNewsletter: async (subscriptionData) => {
    try {
      const response = await emailClient.post('/subscribe/newsletter', subscriptionData);
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
   * Send contact form message
   */
  sendContactEmail: async (contactData) => {
    try {
      const response = await emailClient.post('/send/contact', contactData);
      return {
        success: true,
        message: 'Contact message sent successfully',
        id: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send contact message'
      };
    }
  }
};

export default emailApi;