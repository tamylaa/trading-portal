import axios from 'axios';
import API_CONFIG from '../config/api';

// Create a custom axios instance for auth requests
const authClient = axios.create({
  baseURL: API_CONFIG.AUTH_SERVICE.BASE_URL,
  timeout: API_CONFIG.AUTH_SERVICE.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Send cookies with requests
});

// Helper function to handle API errors
const handleApiError = (error, context = '') => {
  const errorMessage = error.response?.data?.message || error.message;
  const errorCode = error.response?.status || error.code;
  
  console.error(`Auth API Error${context ? ` (${context})` : ''}:`, {
    message: errorMessage,
    code: errorCode,
    url: error.config?.url,
    method: error.config?.method,
    response: error.response?.data
  });
  
  // Handle network/CORS errors
  if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
    const isCorsIssue = !error.response && error.request;
    if (isCorsIssue) {
      throw new Error('Unable to connect to the authentication service. Please check your network connection.');
    }
  }

  // Handle specific HTTP status codes
  if (error.response) {
    switch (error.response.status) {
      case 400:
        throw new Error(errorMessage || 'Invalid request. Please check your input and try again.');
      case 401:
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        throw new Error('Your session has expired. Please log in again.');
      case 403:
        throw new Error('You do not have permission to perform this action.');
      case 404:
        throw new Error('The requested resource was not found.');
      case 409:
        throw new Error('A user with this email already exists.');
      case 422:
        throw new Error(errorMessage || 'Validation failed. Please check your input.');
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        throw new Error('A server error occurred. Please try again later.');
      case 503:
        throw new Error('The authentication service is currently unavailable. Please try again later.');
      default:
        throw new Error(errorMessage || 'An unexpected error occurred');
    }
  }

  throw new Error(errorMessage || 'An unexpected error occurred');
};

export const authApi = {
  /**
   * Request a magic link for authentication
   * @param {string} email - User's email address
   * @param {string} [name] - User's name (optional, used for new accounts)
   * @param {string} [ipAddress] - User's IP address for security logging
   * @param {string} [userAgent] - User's browser user agent
   * @returns {Promise<{success: boolean, message: string, isNewUser?: boolean}>}
   */
  requestMagicLink: async (email, name, ipAddress = '', userAgent = '') => {
    try {
      const response = await authClient.post(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.REQUEST_MAGIC_LINK,
        { 
          email: email.toLowerCase().trim(),
          name: name?.trim(),
          clientInfo: { ipAddress, userAgent }
        }
      );

      return {
        success: response.status === 200,
        message: response.data?.message || 'Magic link sent successfully',
        isNewUser: response.data?.isNewUser
      };
    } catch (error) {
      return handleApiError(error, 'requestMagicLink');
    }
  },

  /**
   * Verify a magic link token and authenticate the user
   * @param {string} token - Magic link token from URL
   * @param {string} [ipAddress] - User's IP address for security logging
   * @param {string} [userAgent] - User's browser user agent
   * @returns {Promise<{success: boolean, token: string, user: object, isNewUser?: boolean}>}
   */
  verifyMagicLink: async (token, ipAddress = '', userAgent = '') => {
    try {
      const response = await authClient.post(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.VERIFY_MAGIC_LINK,
        { 
          token,
          clientInfo: { ipAddress, userAgent }
        }
      );

      // Store the token if present
      if (response.data?.token) {
        const storage = response.data.rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', response.data.token);
        
        if (response.data.refreshToken) {
          storage.setItem('refreshToken', response.data.refreshToken);
        }
      }

      return {
        success: response.status === 200,
        token: response.data?.token,
        user: response.data?.user,
        isNewUser: response.data?.isNewUser,
        requiresProfileCompletion: response.data?.requiresProfileCompletion
      };
    } catch (error) {
      return handleApiError(error, 'verifyMagicLink');
    }
  },

  /**
   * Get the current authenticated user's profile
   * @returns {Promise<{success: boolean, user: object}>}
   */
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await authClient.get(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.CURRENT_USER,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: response.status === 200,
        user: response.data,
        requiresProfileCompletion: response.data?.profileComplete === false
      };
    } catch (error) {
      return handleApiError(error, 'getCurrentUser');
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - User profile data to update
   * @returns {Promise<{success: boolean, user: object}>}
   */
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data } = await authClient.put(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.CURRENT_USER,
        {
          name: profileData.name,
          phone: profileData.phone,
          company: profileData.company || '',
          position: profileData.position || ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  /**
   * Check if the auth service is healthy
   * @returns {Promise<{success: boolean, status: number, message: string, version?: string, timestamp?: string}>}
   */
  checkHealth: async () => {
    try {
      const response = await authClient.get(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.HEALTH,
        { 
          timeout: 5000, // Shorter timeout for health checks
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      return {
        success: response.status === 200,
        status: response.status,
        message: response.data?.message || 'Service is healthy',
        version: response.data?.version,
        timestamp: response.data?.timestamp
      };
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return {
        success: false,
        status: error.response?.status || 503,
        message: error.message || 'Auth service is unavailable',
        code: error.code
      };
    }
  },

  /**
   * Log out the current user
   * @param {boolean} [everywhere=false] - If true, revokes all sessions
   * @returns {Promise<{success: boolean}>}
   */
  logout: async (everywhere = false) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      // Call server-side logout if we have a token
      if (token) {
        await authClient.post(
          API_CONFIG.AUTH_SERVICE.ENDPOINTS.LOGOUT,
          { everywhere },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
      
      // Clear client-side tokens
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');
      
      return { success: true };
    } catch (error) {
      // Even if logout fails, clear client-side tokens
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');
      
      console.error('Logout error:', error);
      return { 
        success: false,
        message: error.response?.data?.message || 'Failed to log out properly'
      };
    }
  },

  /**
   * Refresh the authentication token
   * @returns {Promise<{success: boolean, token?: string}>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authClient.post(
        API_CONFIG.AUTH_SERVICE.ENDPOINTS.REFRESH_TOKEN,
        { refreshToken }
      );

      if (response.data?.token) {
        const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
        storage.setItem('authToken', response.data.token);
        
        if (response.data.refreshToken) {
          storage.setItem('refreshToken', response.data.refreshToken);
        }
        
        return {
          success: true,
          token: response.data.token
        };
      }
      
      throw new Error('No token received in refresh response');
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');
      
      return handleApiError(error, 'refreshToken');
    }
  }
};

// Add request interceptor for auth token
authClient.interceptors.request.use(
  (config) => {
    // Skip adding auth token for health check and token refresh endpoints
    const skipAuth = [
      API_CONFIG.AUTH_SERVICE.ENDPOINTS.HEALTH,
      API_CONFIG.AUTH_SERVICE.ENDPOINTS.REFRESH_TOKEN
    ].some(endpoint => config.url.endsWith(endpoint));
    
    if (!skipAuth) {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling token refresh
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { success, token } = await authApi.refreshToken();
        
        if (success && token) {
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return authClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Redirect to login or handle as needed
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default authApi;
