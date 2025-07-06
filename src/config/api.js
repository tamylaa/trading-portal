/**
 * API Configuration
 * 
 * This file contains all API endpoints and related constants.
 * Environment-specific configurations should be managed through environment variables.
 */

const API_CONFIG = {
  // Base URLs
  AUTH_SERVICE: {
    BASE_URL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001',
    ENDPOINTS: {
      REQUEST_MAGIC_LINK: '/api/auth/magiclink',
      VERIFY_MAGIC_LINK: '/api/auth/verify',
      CURRENT_USER: '/api/auth/me',
      HEALTH: '/health'
    }
  },
  
  EMAIL_SERVICE: {
    BASE_URL: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://auto_email.tamyla.com',
    ENDPOINTS: {
      SEND_EMAIL: '/emails',
      HEALTH: '/health'
    }
  },
  
  // Default timeouts in milliseconds
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    AUTH: 15000,   // 15 seconds
    EMAIL: 10000   // 10 seconds
  },
  
  // Default pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  // Feature flags
  FEATURES: {
    MAGIC_LINK: true,
    EMAIL_NOTIFICATIONS: true
  }
};

export default API_CONFIG;
