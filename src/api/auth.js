import axios from 'axios';
import API_CONFIG from '../config/api';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  const errorMessage = error.response?.data?.message || 
                     error.response?.statusText || 
                     error.message || 
                     'An unexpected error occurred';
  throw new Error(errorMessage);
};

/**
 * Check if the email service is available
 * @returns {Promise<{success: boolean, status: number, message: string}>}
 */
const checkEmailServiceHealth = async () => {
  try {
    const response = await axios.get(
      `${API_CONFIG.EMAIL_SERVICE.BASE_URL}${API_CONFIG.EMAIL_SERVICE.ENDPOINTS.HEALTH}`,
      { timeout: API_CONFIG.TIMEOUTS.EMAIL }
    );
    return {
      success: response.status === 200,
      status: response.status,
      message: response.data?.message || 'Service is healthy'
    };
  } catch (error) {
    console.error('Email service health check failed:', error);
    return {
      success: false,
      status: error.response?.status || 503,
      message: error.message || 'Email service is unavailable'
    };
  }
};

export const authApi = {
  /**
   * Request a magic link for authentication
   * @param {string} email - User's email address
   * @param {string} [name] - User's name (optional, used for new accounts)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  requestMagicLink: async (email, name) => {
    try {
      // First check if email service is available
      const healthCheck = await checkEmailServiceHealth();
      if (!healthCheck.success) {
        throw new Error(`Email service is unavailable: ${healthCheck.message}`);
      }

      const response = await axios.post(
        `${API_CONFIG.AUTH_SERVICE.BASE_URL}${API_CONFIG.AUTH_SERVICE.ENDPOINTS.REQUEST_MAGIC_LINK}`,
        { email, name: name || '' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.AUTH
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Verify a magic link token and authenticate the user
   * @param {string} token - Magic link token from URL
   * @returns {Promise<{success: boolean, token: string, user: object}>}
   */
  verifyMagicLink: async (token) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.AUTH_SERVICE.BASE_URL}${API_CONFIG.AUTH_SERVICE.ENDPOINTS.VERIFY_MAGIC_LINK}`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.AUTH
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get the current authenticated user's profile
   * @param {string} token - JWT token
   * @returns {Promise<{success: boolean, user: object}>}
   */
  getCurrentUser: async (token) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.AUTH_SERVICE.BASE_URL}${API_CONFIG.AUTH_SERVICE.ENDPOINTS.CURRENT_USER}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: API_CONFIG.TIMEOUTS.AUTH
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Check if the auth service is healthy
   * @returns {Promise<{success: boolean, status: number, message: string}>}
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.AUTH_SERVICE.BASE_URL}${API_CONFIG.AUTH_SERVICE.ENDPOINTS.HEALTH}`,
        { timeout: API_CONFIG.TIMEOUTS.AUTH }
      );
      return {
        success: response.status === 200,
        status: response.status,
        message: response.data?.message || 'Service is healthy'
      };
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return {
        success: false,
        status: error.response?.status || 503,
        message: error.message || 'Auth service is unavailable'
      };
    }
  },

  /**
   * Log out the current user (client-side only)
   * @returns {Promise<{success: boolean}>}
   */
  logout: async () => ({
    success: true
  })
};

// Set up axios defaults
axios.defaults.withCredentials = true;

// Add a request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401 Unauthorized
      localStorage.removeItem('authToken');
      // You might want to redirect to login here or handle it in your components
    }
    return Promise.reject(error);
  }
);
