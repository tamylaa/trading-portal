/**
 * Content Hub API Configuration
 *
 * This file contains API configuration specific to the Content Hub package.
 */

const API_CONFIG = {
  // Default timeouts in milliseconds
  TIMEOUTS: {
    DEFAULT: 30000,  // 30 seconds for content operations
    UPLOAD: 60000,   // 1 minute for file uploads
  },

  // Environment
  ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  IS_PRODUCTION: (process.env.NODE_ENV || 'development') === 'production'
};

export default API_CONFIG;