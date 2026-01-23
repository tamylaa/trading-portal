/**
 * Configuration API for external applications
 * Allows reading and updating Contact Hub configuration
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

  // Contact fields validation
  if (updates.fields) {
    if (updates.fields.required && !Array.isArray(updates.fields.required)) {
      errors.push('Required fields must be an array');
    }
    if (updates.fields.optional && !Array.isArray(updates.fields.optional)) {
      errors.push('Optional fields must be an array');
    }
  }

  // Behavior validation
  if (updates.behavior) {
    if (updates.behavior.itemsPerPage && (updates.behavior.itemsPerPage < 1 || updates.behavior.itemsPerPage > 1000)) {
      errors.push('Items per page must be between 1 and 1000');
    }
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
    // Include shared configuration schema plus contact-specific fields
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
        // Contact Hub specific UI properties
        showContactList: { type: 'boolean' },
        showContactForm: { type: 'boolean' },
        showSearch: { type: 'boolean' },
        showFilters: { type: 'boolean' },
        showImport: { type: 'boolean' },
        showExport: { type: 'boolean' },
        enableBulkActions: { type: 'boolean' }
      }
    },
    behavior: {
      type: 'object',
      properties: {
        defaultView: { type: 'string', enum: ['list', 'grid', 'table'] },
        itemsPerPage: { type: 'number', minimum: 1, maximum: 1000 },
        maxFileSize: { type: 'number', maximum: 104857600 },
        allowedImportTypes: { type: 'array', items: { type: 'string' } },
        enableContactValidation: { type: 'boolean' },
        autoSave: { type: 'boolean' },
        enableDuplicatesCheck: { type: 'boolean' }
      }
    },
    fields: {
      type: 'object',
      properties: {
        required: { type: 'array', items: { type: 'string' } },
        optional: { type: 'array', items: { type: 'string' } },
        custom: { type: 'array', items: { type: 'string' } },
        validation: { type: 'object' }
      }
    },
    features: {
      type: 'object',
      properties: {
        analytics: { type: 'boolean' },
        notifications: { type: 'boolean' },
        logging: { type: 'boolean' },
        // Contact Hub specific features
        contactImport: { type: 'boolean' },
        contactExport: { type: 'boolean' },
        bulkOperations: { type: 'boolean' },
        advancedSearch: { type: 'boolean' },
        contactGroups: { type: 'boolean' },
        contactTags: { type: 'boolean' },
        contactNotes: { type: 'boolean' },
        contactActivities: { type: 'boolean' }
      }
    },
    events: {
      type: 'object',
      properties: {
        enableContactCreated: { type: 'boolean' },
        enableContactUpdated: { type: 'boolean' },
        enableContactDeleted: { type: 'boolean' },
        enableContactImported: { type: 'boolean' },
        enableContactExported: { type: 'boolean' },
        enableSearchChanged: { type: 'boolean' },
        enableFilterChanged: { type: 'boolean' },
        enableBulkAction: { type: 'boolean' }
      }
    },
    performance: {
      type: 'object',
      properties: {
        cacheEnabled: { type: 'boolean' },
        cacheTTL: { type: 'number' },
        lazyLoading: { type: 'boolean' },
        virtualizationThreshold: { type: 'number' },
        lazyLoadContacts: { type: 'boolean' },
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
const configApi = {
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

export default configApi;