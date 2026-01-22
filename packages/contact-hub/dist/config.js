"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateConfigSection = exports.updateConfig = exports.subscribeToConfig = exports.resetConfig = exports.importConfig = exports.getConfigSection = exports.getConfig = exports.exportConfig = exports.configManager = void 0;
var _shared = require("@tamyla/shared");
/**
 * Contact Hub Configuration
 *
 * Uses the shared configuration system with hub-specific defaults.
 */

// Contact Hub specific configuration defaults
const CONTACT_HUB_DEFAULTS = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_CONTACT_API_URL || 'https://contacts.tamyla.com',
    timeout: parseInt(process.env.REACT_APP_CONTACT_API_TIMEOUT) || 30000,
    retries: parseInt(process.env.REACT_APP_CONTACT_API_RETRIES) || 3,
    retryDelay: parseInt(process.env.REACT_APP_CONTACT_API_RETRY_DELAY) || 1000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_CONTACT_CLIENT_VERSION || '1.0.0'
    }
  },
  // Authentication Configuration
  auth: {
    tokenStorage: process.env.REACT_APP_CONTACT_AUTH_STORAGE || 'localStorage',
    tokenKey: process.env.REACT_APP_CONTACT_AUTH_TOKEN_KEY || 'authToken',
    refreshTokenKey: process.env.REACT_APP_CONTACT_AUTH_REFRESH_KEY || 'refreshToken',
    autoRefresh: process.env.REACT_APP_CONTACT_AUTH_AUTO_REFRESH === 'true',
    refreshThreshold: parseInt(process.env.REACT_APP_CONTACT_AUTH_REFRESH_THRESHOLD) || 300000
  },
  // UI Configuration
  ui: {
    showContactList: process.env.REACT_APP_CONTACT_SHOW_LIST !== 'false',
    showContactForm: process.env.REACT_APP_CONTACT_SHOW_FORM !== 'false',
    showSearch: process.env.REACT_APP_CONTACT_SHOW_SEARCH !== 'false',
    showFilters: process.env.REACT_APP_CONTACT_SHOW_FILTERS !== 'false',
    showImport: process.env.REACT_APP_CONTACT_SHOW_IMPORT !== 'false',
    showExport: process.env.REACT_APP_CONTACT_SHOW_EXPORT !== 'false',
    enableBulkActions: process.env.REACT_APP_CONTACT_ENABLE_BULK_ACTIONS !== 'false',
    enableKeyboardShortcuts: process.env.REACT_APP_CONTACT_ENABLE_SHORTCUTS !== 'false'
  },
  // Behavior Configuration
  behavior: {
    defaultView: process.env.REACT_APP_CONTACT_DEFAULT_VIEW || 'list',
    // 'list' | 'grid' | 'table'
    itemsPerPage: parseInt(process.env.REACT_APP_CONTACT_ITEMS_PER_PAGE) || 25,
    maxFileSize: parseInt(process.env.REACT_APP_CONTACT_MAX_FILE_SIZE) || 10 * 1024 * 1024,
    // 10MB for imports
    allowedImportTypes: (process.env.REACT_APP_CONTACT_ALLOWED_IMPORT_TYPES || 'text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').split(','),
    enableContactValidation: process.env.REACT_APP_CONTACT_ENABLE_VALIDATION !== 'false',
    autoSave: process.env.REACT_APP_CONTACT_AUTO_SAVE === 'true',
    enableDuplicatesCheck: process.env.REACT_APP_CONTACT_ENABLE_DUPLICATES_CHECK !== 'false'
  },
  // Feature Flags
  features: {
    contactImport: process.env.REACT_APP_CONTACT_IMPORT_ENABLED !== 'false',
    contactExport: process.env.REACT_APP_CONTACT_EXPORT_ENABLED !== 'false',
    bulkOperations: process.env.REACT_APP_CONTACT_BULK_OPERATIONS !== 'false',
    advancedSearch: process.env.REACT_APP_CONTACT_ADVANCED_SEARCH !== 'false',
    contactGroups: process.env.REACT_APP_CONTACT_GROUPS_ENABLED !== 'false',
    contactTags: process.env.REACT_APP_CONTACT_TAGS_ENABLED !== 'false',
    contactNotes: process.env.REACT_APP_CONTACT_NOTES_ENABLED !== 'false',
    contactActivities: process.env.REACT_APP_CONTACT_ACTIVITIES_ENABLED !== 'false'
  },
  // Contact Field Configuration
  fields: {
    required: (process.env.REACT_APP_CONTACT_REQUIRED_FIELDS || 'name,email').split(','),
    optional: (process.env.REACT_APP_CONTACT_OPTIONAL_FIELDS || 'phone,company,title,address,city,state,zip,country,website,socialLinks').split(','),
    custom: (process.env.REACT_APP_CONTACT_CUSTOM_FIELDS || '').split(',').filter(Boolean),
    validation: {
      email: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      },
      phone: {
        pattern: '^[+]?[\\d\\s\\-\\(\\)]+$'
      },
      website: {
        pattern: '^https?://.+'
      }
    }
  },
  // Styling Configuration
  styling: {
    theme: process.env.REACT_APP_CONTACT_THEME || 'default',
    customCSS: process.env.REACT_APP_CONTACT_CUSTOM_CSS || '',
    componentClassName: process.env.REACT_APP_CONTACT_COMPONENT_CLASS || 'contact-hub',
    buttonClassName: process.env.REACT_APP_CONTACT_BUTTON_CLASS || 'contact-hub-btn',
    notificationClassName: process.env.REACT_APP_CONTACT_NOTIFICATION_CLASS || 'contact-hub-notification'
  },
  // Event Configuration
  events: {
    enableContactCreated: process.env.REACT_APP_CONTACT_EVENT_CREATED !== 'false',
    enableContactUpdated: process.env.REACT_APP_CONTACT_EVENT_UPDATED !== 'false',
    enableContactDeleted: process.env.REACT_APP_CONTACT_EVENT_DELETED !== 'false',
    enableContactImported: process.env.REACT_APP_CONTACT_EVENT_IMPORTED !== 'false',
    enableContactExported: process.env.REACT_APP_CONTACT_EVENT_EXPORTED !== 'false',
    enableSearchChanged: process.env.REACT_APP_CONTACT_EVENT_SEARCH !== 'false',
    enableFilterChanged: process.env.REACT_APP_CONTACT_EVENT_FILTER !== 'false',
    enableBulkAction: process.env.REACT_APP_CONTACT_EVENT_BULK_ACTION !== 'false'
  },
  // Performance Configuration
  performance: {
    lazyLoadContacts: process.env.REACT_APP_CONTACT_LAZY_LOAD !== 'false',
    virtualizationThreshold: parseInt(process.env.REACT_APP_CONTACT_VIRTUALIZATION) || 100,
    cacheEnabled: process.env.REACT_APP_CONTACT_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.REACT_APP_CONTACT_CACHE_TTL) || 300000,
    // 5 minutes
    preloadAdjacent: process.env.REACT_APP_CONTACT_PRELOAD_ADJACENT !== 'false'
  },
  // Integration Configuration
  integrations: {
    meiliSearch: {
      enabled: process.env.REACT_APP_CONTACT_MEILI_ENABLED !== 'false',
      host: process.env.REACT_APP_CONTACT_MEILI_HOST || 'https://search.tamyla.com',
      apiKey: process.env.REACT_APP_CONTACT_MEILI_API_KEY || '',
      indexName: process.env.REACT_APP_CONTACT_MEILI_INDEX || 'contacts'
    },
    webComponent: {
      enabled: process.env.REACT_APP_CONTACT_WEB_COMPONENT !== 'false',
      scriptUrl: process.env.REACT_APP_CONTACT_WEB_COMPONENT_URL || '/ui-components/contact-manager-fixed.js',
      elementName: process.env.REACT_APP_CONTACT_ELEMENT_NAME || 'tamyla-contact-manager'
    }
  },
  // Notification Configuration
  notifications: {
    enabled: process.env.REACT_APP_CONTACT_NOTIFICATIONS_ENABLED !== 'false',
    duration: parseInt(process.env.REACT_APP_CONTACT_NOTIFICATION_DURATION) || 5000,
    position: process.env.REACT_APP_CONTACT_NOTIFICATION_POSITION || 'top-right',
    maxNotifications: parseInt(process.env.REACT_APP_CONTACT_NOTIFICATION_MAX) || 5
  },
  // Error Handling Configuration
  errorHandling: {
    showUserFriendlyMessages: process.env.REACT_APP_CONTACT_USER_FRIENDLY_ERRORS !== 'false',
    logErrors: process.env.REACT_APP_CONTACT_LOG_ERRORS !== 'false',
    reportErrors: process.env.REACT_APP_CONTACT_REPORT_ERRORS === 'true',
    errorReportingUrl: process.env.REACT_APP_CONTACT_ERROR_REPORTING_URL || ''
  }
};

// Create hub-specific configuration manager
const configManager = exports.configManager = (0, _shared.createHubConfigManager)('contact-hub', CONTACT_HUB_DEFAULTS);

// Export convenience functions
const getConfig = () => configManager.getConfiguration();
exports.getConfig = getConfig;
const updateConfig = updates => configManager.updateConfiguration(updates);
exports.updateConfig = updateConfig;
const subscribeToConfig = listener => configManager.subscribe(listener);
exports.subscribeToConfig = subscribeToConfig;
const resetConfig = () => configManager.resetToDefaults();
exports.resetConfig = resetConfig;
const getConfigSection = section => configManager.getConfigurationSection(section);
exports.getConfigSection = getConfigSection;
const updateConfigSection = (section, updates) => configManager.updateConfigurationSection(section, updates);
exports.updateConfigSection = updateConfigSection;
const exportConfig = () => configManager.exportConfiguration();
exports.exportConfig = exportConfig;
const importConfig = json => configManager.importConfiguration(json);

// Initialize configuration
exports.importConfig = importConfig;
configManager.loadConfiguration();