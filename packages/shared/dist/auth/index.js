/**
 * Shared Authentication Service
 *
 * Provides authentication functionality for hubs and applications.
 * Supports token management, refresh logic, and authentication state.
 */

import { getConfig } from '../config';
export class AuthService {
  constructor(configManager = null) {
    this.configManager = configManager;
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.listeners = [];
    this.refreshTimeout = null;
    this.initialize();
  }

  /**
   * Initialize authentication service
   */
  initialize() {
    this.loadStoredTokens();
    this.setupAutoRefresh();
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.configManager ? this.configManager.getConfiguration() : getConfig();
  }

  /**
   * Load stored tokens from storage
   */
  loadStoredTokens() {
    try {
      const config = this.getConfig();
      const storage = config.auth.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      const token = storage.getItem(config.auth.tokenKey);
      const refreshToken = storage.getItem(config.auth.refreshTokenKey);
      if (token) {
        this.token = token;
      }
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
    }
  }

  /**
   * Save tokens to storage
   */
  saveTokens() {
    try {
      const config = this.getConfig();
      const storage = config.auth.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      if (this.token) {
        storage.setItem(config.auth.tokenKey, this.token);
      }
      if (this.refreshToken) {
        storage.setItem(config.auth.refreshTokenKey, this.refreshToken);
      }
    } catch (error) {
      console.warn('Failed to save tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens() {
    try {
      const config = this.getConfig();
      const storage = config.auth.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(config.auth.tokenKey);
      storage.removeItem(config.auth.refreshTokenKey);
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupAutoRefresh() {
    const config = this.getConfig();
    if (config.auth.autoRefresh && this.refreshToken) {
      this.scheduleRefresh();
    }
  }

  /**
   * Schedule token refresh
   */
  scheduleRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    const config = this.getConfig();
    const threshold = config.auth.refreshThreshold;

    // Schedule refresh before token expires
    this.refreshTimeout = setTimeout(async () => {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.warn('Auto refresh failed:', error);
        this.notifyListeners('authError', {
          error: 'Token refresh failed'
        });
      }
    }, threshold);
  }

  /**
   * Login with credentials
   */
  async login(credentials) {
    try {
      const config = this.getConfig();
      const response = await fetch(`${config.api.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.api.headers
        },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      this.user = data.user;
      this.notifyListeners('login', {
        user: this.user
      });
      return {
        success: true,
        user: this.user
      };
    } catch (error) {
      this.notifyListeners('authError', {
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const config = this.getConfig();
      if (this.token) {
        await fetch(`${config.api.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            ...config.api.headers
          }
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    this.clearTokens();
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    this.notifyListeners('logout');
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    try {
      const config = this.getConfig();
      const response = await fetch(`${config.api.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.api.headers
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      this.notifyListeners('tokenRefreshed', {
        user: this.user
      });
      return {
        success: true
      };
    } catch (error) {
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(token, refreshToken = null) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    this.saveTokens();
    this.setupAutoRefresh();
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`
    } : {};
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Subscribe to authentication events
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of authentication events
   */
  notifyListeners(event, data = {}) {
    this.listeners.forEach(listener => listener(event, data));
  }

  /**
   * Validate token (check if still valid)
   */
  async validateToken() {
    if (!this.token) {
      return false;
    }
    try {
      const config = this.getConfig();
      const response = await fetch(`${config.api.baseURL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          ...config.api.headers
        }
      });
      return response.ok;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }
}

// Create shared authentication service instance
export const authService = new AuthService();

// Export convenience functions
export const login = credentials => authService.login(credentials);
export const logout = () => authService.logout();
export const isAuthenticated = () => authService.isAuthenticated();
export const getCurrentUser = () => authService.getCurrentUser();
export const getAuthHeader = () => authService.getAuthHeader();
export const subscribeToAuth = listener => authService.subscribe(listener);

/**
 * Create hub-specific authentication service
 */
export const createHubAuthService = configManager => {
  return new AuthService(configManager);
};