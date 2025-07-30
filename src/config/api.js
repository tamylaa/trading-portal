/**
 * API Configuration
 * 
 * This file contains all API endpoints and related constants.
 * Environment-specific configurations should be managed through environment variables.
 */

// Helper function to get environment variable with fallback
const getEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} is not set. Using default value: ${defaultValue}`);
    return defaultValue;
  }
  return value;
};

const API_CONFIG = {
  // Auth Service Configuration
  AUTH_SERVICE: {
    // Base URL for authentication service
    BASE_URL: getEnv('REACT_APP_AUTH_SERVICE_URL', 'http://localhost:3001'),
    
    // Authentication endpoints
    ENDPOINTS: {
      REQUEST_MAGIC_LINK: '/auth/magic-link',    // Request magic link
      VERIFY_MAGIC_LINK: '/auth/verify',         // Verify magic link
      CURRENT_USER: '/auth/me',                  // Get current user
      HEALTH: '/health'                          // Health check
    },
    
    // Timeout for auth requests (in ms)
    TIMEOUT: 15000
  },
  
  // Default timeouts in milliseconds
  TIMEOUTS: {
    DEFAULT: 10000,  // 10 seconds
    AUTH: 15000,    // 15 seconds
  },
  
  // Default pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  // Feature flags
  FEATURES: {
    // Enable/disable magic link authentication
    MAGIC_LINK_AUTH: getEnv('REACT_APP_FEATURE_MAGIC_LINK_AUTH', 'true') === 'true',
    
    // Enable/disable username/password authentication
    PASSWORD_AUTH: getEnv('REACT_APP_FEATURE_PASSWORD_AUTH', 'false') === 'true',
    
    // Enable/disable social authentication
    SOCIAL_AUTH: getEnv('REACT_APP_FEATURE_SOCIAL_AUTH', 'false') === 'true'
  },
  
  // Environment
  ENV: getEnv('NODE_ENV', 'development'),
  IS_DEVELOPMENT: getEnv('NODE_ENV', 'development') === 'development',
  IS_PRODUCTION: getEnv('NODE_ENV', 'development') === 'production'
};

// Log API config in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    AUTH_SERVICE: API_CONFIG.AUTH_SERVICE.BASE_URL,
    FEATURES: API_CONFIG.FEATURES
  });
}

export default API_CONFIG;
