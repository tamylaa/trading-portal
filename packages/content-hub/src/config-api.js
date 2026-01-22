/**
 * Configuration API for external applications
 * Allows reading and updating Content Hub configuration
 */

import { configManager } from './config';

/**
 * Get current configuration
 * @returns {Object} Current configuration object
 */
export const getConfiguration = () => {
  return configManager.getConfiguration();
};

/**
 * Update configuration with new values
 * @param {Object} updates - Configuration updates
 * @returns {Object} Updated configuration
 */
export const updateConfiguration = (updates) => {
  configManager.updateConfiguration(updates);
  return configManager.getConfiguration();
};

/**
 * Reset configuration to defaults
 * @returns {Object} Default configuration
 */
export const resetConfiguration = () => {
  configManager.resetToDefaults();
  return configManager.getConfiguration();
};

/**
 * Get configuration for a specific section
 * @param {string} section - Configuration section (api, ui, behavior, etc.)
 * @returns {Object} Section configuration
 */
export const getConfigurationSection = (section) => {
  return configManager.getConfigurationSection(section);
};

/**
 * Update configuration for a specific section
 * @param {string} section - Configuration section
 * @param {Object} updates - Section updates
 * @returns {Object} Updated section configuration
 */
export const updateConfigurationSection = (section, updates) => {
  configManager.updateConfigurationSection(section, updates);
  return configManager.getConfigurationSection(section);
};

/**
 * Validate configuration updates
 * @param {Object} updates - Configuration updates to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export const validateConfiguration = (updates) => {
  const errors = [];

  // API validation
  if (updates.api) {
    if (updates.api.baseURL && !updates.api.baseURL.startsWith('http')) {
      errors.push('API baseURL must be a valid HTTP/HTTPS URL');
    }
    if (updates.api.timeout && (updates.api.timeout < 1000 || updates.api.timeout > 300000)) {
      errors.push('API timeout must be between 1000ms and 300000ms');
    }
  }

  // UI validation
  if (updates.ui) {
    // Add UI-specific validations
  }

  // Behavior validation
  if (updates.behavior) {
    if (updates.behavior.maxFileSize && updates.behavior.maxFileSize > 100 * 1024 * 1024) {
      errors.push('Maximum file size cannot exceed 100MB');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Export configuration to JSON
 * @returns {string} JSON string of current configuration
 */
export const exportConfiguration = () => {
  return configManager.exportConfiguration();
};

/**
 * Import configuration from JSON
 * @param {string} jsonConfig - JSON string of configuration
 * @returns {Object} Import result { success: boolean, errors: string[] }
 */
export const importConfiguration = (jsonConfig) => {
  return configManager.importConfiguration(jsonConfig);
};

/**
 * Subscribe to configuration changes
 * @param {Function} callback - Callback function called when config changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToConfigurationChanges = (callback) => {
  return configManager.subscribe(callback);
};

/**
 * Get configuration schema for validation/documentation
 * @returns {Object} Configuration schema
 */
export const getConfigurationSchema = () => {
  return {
    // Include shared configuration schema
    api: {
      type: 'object',
      properties: {
        baseURL: { type: 'string', format: 'uri' },
        timeout: { type: 'number', minimum: 1000, maximum: 300000 },
        retries: { type: 'number', minimum: 0, maximum: 10 },
        retryDelay: { type: 'number', minimum: 100, maximum: 10000 },
        headers: { type: 'object' }
      }
    },
    auth: {
      type: 'object',
      properties: {
        tokenStorage: { type: 'string', enum: ['localStorage', 'sessionStorage'] },
        tokenKey: { type: 'string' },
        refreshTokenKey: { type: 'string' },
        autoRefresh: { type: 'boolean' },
        refreshThreshold: { type: 'number' }
      }
    },
    ui: {
      type: 'object',
      properties: {
        theme: { type: 'string' },
        language: { type: 'string' },
        enableAnimations: { type: 'boolean' },
        enableKeyboardShortcuts: { type: 'boolean' },
        // Content Hub specific UI properties
        showUpload: { type: 'boolean' },
        showGallery: { type: 'boolean' },
        showSearch: { type: 'boolean' },
        showSharing: { type: 'boolean' },
        showFilters: { type: 'boolean' },
        showBulkActions: { type: 'boolean' },
        enableDragDrop: { type: 'boolean' }
      }
    },
    behavior: {
      type: 'object',
      properties: {
        selectionMode: { type: 'boolean' },
        multiSelect: { type: 'boolean' },
        maxFileSize: { type: 'number', maximum: 104857600 }, // 100MB
        allowedFileTypes: { type: 'array', items: { type: 'string' } },
        maxFilesPerUpload: { type: 'number', minimum: 1, maximum: 100 },
        enableFilePreview: { type: 'boolean' },
        autoProcessUploads: { type: 'boolean' }
      }
    },
    features: {
      type: 'object',
      properties: {
        analytics: { type: 'boolean' },
        notifications: { type: 'boolean' },
        logging: { type: 'boolean' },
        // Content Hub specific features
        contentSkimming: { type: 'boolean' },
        aiMetadata: { type: 'boolean' },
        versionControl: { type: 'boolean' },
        collaboration: { type: 'boolean' }
      }
    },
    styling: {
      type: 'object',
      properties: {
        theme: { type: 'string' },
        customCSS: { type: 'string' },
        componentClassName: { type: 'string' },
        buttonClassName: { type: 'string' },
        notificationClassName: { type: 'string' }
      }
    },
    events: {
      type: 'object',
      properties: {
        enableContentUploaded: { type: 'boolean' },
        enableAuthRequired: { type: 'boolean' },
        enableError: { type: 'boolean' },
        enableSearchChanged: { type: 'boolean' },
        enableFilterChanged: { type: 'boolean' },
        enableSelectionChanged: { type: 'boolean' },
        enableContentShared: { type: 'boolean' }
      }
    },
    performance: {
      type: 'object',
      properties: {
        cacheEnabled: { type: 'boolean' },
        cacheTTL: { type: 'number' },
        lazyLoading: { type: 'boolean' },
        virtualizationThreshold: { type: 'number' },
        lazyLoadImages: { type: 'boolean' },
        preloadAdjacent: { type: 'boolean' }
      }
    },
    integrations: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        meiliSearch: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            host: { type: 'string', format: 'uri' },
            apiKey: { type: 'string' },
            indexName: { type: 'string' }
          }
        },
        webComponent: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            scriptUrl: { type: 'string' },
            elementName: { type: 'string' }
          }
        }
      }
    },
    notifications: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        duration: { type: 'number' },
        position: { type: 'string' },
        maxNotifications: { type: 'number' }
      }
    },
    errorHandling: {
      type: 'object',
      properties: {
        showUserFriendlyMessages: { type: 'boolean' },
        logErrors: { type: 'boolean' },
        reportErrors: { type: 'boolean' },
        errorReportingUrl: { type: 'string', format: 'uri' }
      }
    }
  };
};

// Export all functions
export default {
  getConfiguration,
  updateConfiguration,
  resetConfiguration,
  getConfigurationSection,
  updateConfigurationSection,
  validateConfiguration,
  exportConfiguration,
  importConfiguration,
  subscribeToConfigurationChanges,
  getConfigurationSchema
};