/**
 * Shared Configuration System
 *
 * Generic configuration management system that can be used by any hub or application.
 * Supports multiple configuration sources with customizable priority and validation.
 */

// Default configuration template - can be extended by specific hubs
export const DEFAULT_CONFIG = {
  // Core API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://api.tamyla.com',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    retries: parseInt(process.env.REACT_APP_API_RETRIES) || 3,
    retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY) || 1000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_CLIENT_VERSION || '1.0.0'
    }
  },
  // Authentication Configuration
  auth: {
    tokenStorage: process.env.REACT_APP_AUTH_STORAGE || 'localStorage',
    tokenKey: process.env.REACT_APP_AUTH_TOKEN_KEY || 'authToken',
    refreshTokenKey: process.env.REACT_APP_AUTH_REFRESH_KEY || 'refreshToken',
    autoRefresh: process.env.REACT_APP_AUTH_AUTO_REFRESH === 'true',
    refreshThreshold: parseInt(process.env.REACT_APP_AUTH_REFRESH_THRESHOLD) || 300000
  },
  // UI Configuration
  ui: {
    theme: process.env.REACT_APP_THEME || 'default',
    language: process.env.REACT_APP_LANGUAGE || 'en',
    enableAnimations: process.env.REACT_APP_ENABLE_ANIMATIONS !== 'false',
    enableKeyboardShortcuts: process.env.REACT_APP_ENABLE_SHORTCUTS !== 'false'
  },
  // Feature Flags
  features: {
    analytics: process.env.REACT_APP_ANALYTICS_ENABLED !== 'false',
    notifications: process.env.REACT_APP_NOTIFICATIONS_ENABLED !== 'false',
    logging: process.env.REACT_APP_LOGGING_ENABLED !== 'false'
  },
  // Performance Configuration
  performance: {
    cacheEnabled: process.env.REACT_APP_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.REACT_APP_CACHE_TTL) || 3600000,
    lazyLoading: process.env.REACT_APP_LAZY_LOADING !== 'false',
    virtualizationThreshold: parseInt(process.env.REACT_APP_VIRTUALIZATION_THRESHOLD) || 100
  },
  // Error Handling
  errorHandling: {
    showUserFriendlyMessages: process.env.REACT_APP_USER_FRIENDLY_ERRORS !== 'false',
    logErrors: process.env.REACT_APP_LOG_ERRORS !== 'false',
    reportErrors: process.env.REACT_APP_REPORT_ERRORS === 'true',
    errorReportingUrl: process.env.REACT_APP_ERROR_REPORTING_URL || ''
  },
  // Integrations
  integrations: {
    enabled: process.env.REACT_APP_INTEGRATIONS_ENABLED !== 'false'
  }
};

/**
 * Configuration Manager Class
 * Generic configuration management with hub-specific support
 */
export class ConfigurationManager {
  constructor(hubName = 'shared', customDefaults = {}) {
    this.hubName = hubName;
    this.storageKey = `${hubName}Config`;
    this.config = this.deepMerge({}, DEFAULT_CONFIG, customDefaults);
    this.listeners = [];
    this.validators = [];
  }

  /**
   * Deep merge multiple objects
   */
  deepMerge(target, ...sources) {
    const merge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };
    sources.forEach(source => merge(target, source));
    return target;
  }

  /**
   * Load configuration from multiple sources
   */
  async loadConfiguration() {
    // Load from environment variables (already done in defaults)
    // Load from external configuration service
    await this.loadFromService();
    // Load from local storage (user overrides)
    this.loadFromStorage();
    // Notify listeners of configuration changes
    this.notifyListeners();
  }

  /**
   * Load configuration from external service
   */
  async loadFromService() {
    try {
      const serviceUrl = process.env.REACT_APP_CONFIG_SERVICE_URL;
      if (serviceUrl) {
        const response = await fetch(`${serviceUrl}/config/${this.hubName}`);
        if (response.ok) {
          const serviceConfig = await response.json();
          this.mergeConfig(serviceConfig);
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${this.hubName} configuration from service:`, error);
    }
  }

  /**
   * Load configuration from local storage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const userConfig = JSON.parse(stored);
        this.mergeConfig(userConfig);
      }
    } catch (error) {
      console.warn(`Failed to load ${this.hubName} configuration from storage:`, error);
    }
  }

  /**
   * Update configuration with validation
   */
  updateConfiguration(updates) {
    // Validate updates
    const validation = this.validateConfiguration(updates);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
    this.mergeConfig(updates);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Merge configuration updates
   */
  mergeConfig(updates) {
    this.config = this.deepMerge(this.config, updates);
  }

  /**
   * Save configuration to local storage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.warn(`Failed to save ${this.hubName} configuration to storage:`, error);
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration() {
    return this.deepMerge({}, this.config);
  }

  /**
   * Get configuration section
   */
  getConfigurationSection(section) {
    return this.config[section] ? this.deepMerge({}, this.config[section]) : {};
  }

  /**
   * Update configuration section
   */
  updateConfigurationSection(section, updates) {
    const sectionUpdate = {
      [section]: updates
    };
    this.updateConfiguration(sectionUpdate);
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of configuration changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.getConfiguration()));
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults() {
    this.config = this.deepMerge({}, DEFAULT_CONFIG);
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
  }

  /**
   * Add configuration validator
   */
  addValidator(validator) {
    this.validators.push(validator);
  }

  /**
   * Validate configuration
   */
  validateConfiguration(config) {
    const errors = [];

    // Run custom validators
    this.validators.forEach(validator => {
      const result = validator(config);
      if (result && result.errors) {
        errors.push(...result.errors);
      }
    });
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export configuration as JSON
   */
  exportConfiguration() {
    return JSON.stringify(this.getConfiguration(), null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(jsonConfig) {
    try {
      const config = JSON.parse(jsonConfig);
      this.updateConfiguration(config);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Invalid JSON configuration: ${error.message}`
      };
    }
  }
}

// Create shared configuration manager instance
export const sharedConfigManager = new ConfigurationManager('shared');

// Initialize configuration on module load
sharedConfigManager.loadConfiguration();

// Export convenience functions
export const getConfig = () => sharedConfigManager.getConfiguration();
export const updateConfig = updates => sharedConfigManager.updateConfiguration(updates);
export const subscribeToConfig = listener => sharedConfigManager.subscribe(listener);
export const resetConfig = () => sharedConfigManager.resetToDefaults();
export const getConfigSection = section => sharedConfigManager.getConfigurationSection(section);
export const updateConfigSection = (section, updates) => sharedConfigManager.updateConfigurationSection(section, updates);
export const exportConfig = () => sharedConfigManager.exportConfiguration();
export const importConfig = json => sharedConfigManager.importConfiguration(json);

/**
 * Create hub-specific configuration manager
 */
export const createHubConfigManager = (hubName, customDefaults = {}) => {
  return new ConfigurationManager(hubName, customDefaults);
};

// Backwards-compat alias for legacy imports
export const ConfigManager = ConfigurationManager;