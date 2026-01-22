/**
 * Campaign Hub API Configuration
 *
 * This file contains API configuration specific to the Campaign Hub package.
 */

const API_CONFIG = {
  // Default timeouts in milliseconds
  TIMEOUTS: {
    DEFAULT: 30000,  // 30 seconds for campaign operations
    CAMPAIGN: 60000, // 1 minute for bulk campaigns
  },

  // Environment
  ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  IS_PRODUCTION: (process.env.NODE_ENV || 'development') === 'production'
};

export default API_CONFIG;