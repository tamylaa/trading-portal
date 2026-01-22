/**
 * Content Hub Configuration
 *
 * Uses the shared configuration system with hub-specific defaults.
 */

import { createHubConfigManager } from '@tamyla/shared';

// Content Hub specific configuration defaults
const CONTENT_HUB_DEFAULTS = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_CONTENT_API_URL || 'https://content.tamyla.com',
    timeout: parseInt(process.env.REACT_APP_CONTENT_API_TIMEOUT) || 30000,
    retries: parseInt(process.env.REACT_APP_CONTENT_API_RETRIES) || 3,
    retryDelay: parseInt(process.env.REACT_APP_CONTENT_API_RETRY_DELAY) || 1000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_CONTENT_CLIENT_VERSION || '1.0.0',
    },
  },

  // Authentication Configuration
  auth: {
    tokenStorage: process.env.REACT_APP_CONTENT_AUTH_STORAGE || 'localStorage',
    tokenKey: process.env.REACT_APP_CONTENT_AUTH_TOKEN_KEY || 'authToken',
    refreshTokenKey: process.env.REACT_APP_CONTENT_AUTH_REFRESH_KEY || 'refreshToken',
    autoRefresh: process.env.REACT_APP_CONTENT_AUTH_AUTO_REFRESH === 'true',
    refreshThreshold: parseInt(process.env.REACT_APP_CONTENT_AUTH_REFRESH_THRESHOLD) || 300000,
  },

  // UI Configuration
  ui: {
    showUpload: process.env.REACT_APP_CONTENT_SHOW_UPLOAD !== 'false',
    showGallery: process.env.REACT_APP_CONTENT_SHOW_GALLERY !== 'false',
    showSearch: process.env.REACT_APP_CONTENT_SHOW_SEARCH !== 'false',
    showSharing: process.env.REACT_APP_CONTENT_SHOW_SHARING !== 'false',
    showFilters: process.env.REACT_APP_CONTENT_SHOW_FILTERS !== 'false',
    showBulkActions: process.env.REACT_APP_CONTENT_SHOW_BULK_ACTIONS !== 'false',
    enableDragDrop: process.env.REACT_APP_CONTENT_ENABLE_DRAG_DROP !== 'false',
    enableKeyboardShortcuts: process.env.REACT_APP_CONTENT_ENABLE_SHORTCUTS !== 'false',
  },

  // Component Behavior Configuration
  behavior: {
    selectionMode: process.env.REACT_APP_CONTENT_SELECTION_MODE === 'true',
    multiSelect: process.env.REACT_APP_CONTENT_MULTI_SELECT !== 'false',
    maxFileSize: parseInt(process.env.REACT_APP_CONTENT_MAX_FILE_SIZE) || 25 * 1024 * 1024,
    allowedFileTypes: (process.env.REACT_APP_CONTENT_ALLOWED_TYPES || 'image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx').split(','),
    maxFilesPerUpload: parseInt(process.env.REACT_APP_CONTENT_MAX_FILES_UPLOAD) || 10,
    enableFilePreview: process.env.REACT_APP_CONTENT_ENABLE_PREVIEW !== 'false',
    autoProcessUploads: process.env.REACT_APP_CONTENT_AUTO_PROCESS !== 'false',
  },

  // Feature Flags
  features: {
    contentSkimming: process.env.REACT_APP_CONTENT_SKIMMING_ENABLED !== 'false',
    aiMetadata: process.env.REACT_APP_CONTENT_AI_METADATA !== 'false',
    versionControl: process.env.REACT_APP_CONTENT_VERSION_CONTROL !== 'false',
    collaboration: process.env.REACT_APP_CONTENT_COLLABORATION !== 'false',
    analytics: process.env.REACT_APP_CONTENT_ANALYTICS !== 'false',
    notifications: process.env.REACT_APP_CONTENT_NOTIFICATIONS !== 'false',
  },

  // Styling Configuration
  styling: {
    theme: process.env.REACT_APP_CONTENT_THEME || 'default',
    customCSS: process.env.REACT_APP_CONTENT_CUSTOM_CSS || '',
    componentClassName: process.env.REACT_APP_CONTENT_COMPONENT_CLASS || 'content-hub',
    buttonClassName: process.env.REACT_APP_CONTENT_BUTTON_CLASS || 'content-hub-btn',
    notificationClassName: process.env.REACT_APP_CONTENT_NOTIFICATION_CLASS || 'content-hub-notification',
  },

  // Event Configuration
  events: {
    enableContentUploaded: process.env.REACT_APP_CONTENT_EVENT_UPLOADED !== 'false',
    enableAuthRequired: process.env.REACT_APP_CONTENT_EVENT_AUTH !== 'false',
    enableError: process.env.REACT_APP_CONTENT_EVENT_ERROR !== 'false',
    enableSearchChanged: process.env.REACT_APP_CONTENT_EVENT_SEARCH !== 'false',
    enableFilterChanged: process.env.REACT_APP_CONTENT_EVENT_FILTER !== 'false',
    enableSelectionChanged: process.env.REACT_APP_CONTENT_EVENT_SELECTION !== 'false',
    enableContentShared: process.env.REACT_APP_CONTENT_EVENT_SHARED !== 'false',
  },

  // Performance Configuration
  performance: {
    lazyLoadImages: process.env.REACT_APP_CONTENT_LAZY_LOAD !== 'false',
    virtualizationThreshold: parseInt(process.env.REACT_APP_CONTENT_VIRTUALIZATION) || 100,
    cacheEnabled: process.env.REACT_APP_CONTENT_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.REACT_APP_CONTENT_CACHE_TTL) || 3600000,
    preloadAdjacent: process.env.REACT_APP_CONTENT_PRELOAD_ADJACENT !== 'false',
  },

  // Integration Configuration
  integrations: {
    meiliSearch: {
      enabled: process.env.REACT_APP_CONTENT_MEILI_ENABLED !== 'false',
      host: process.env.REACT_APP_CONTENT_MEILI_HOST || 'https://search.tamyla.com',
      apiKey: process.env.REACT_APP_CONTENT_MEILI_API_KEY || '',
      indexName: process.env.REACT_APP_CONTENT_MEILI_INDEX || 'content',
    },
    webComponent: {
      enabled: process.env.REACT_APP_CONTENT_WEB_COMPONENT !== 'false',
      scriptUrl: process.env.REACT_APP_CONTENT_WEB_COMPONENT_URL || '/ui-components/content-manager-fixed.js',
      elementName: process.env.REACT_APP_CONTENT_ELEMENT_NAME || 'tamyla-content-manager',
    },
  },

  // Notification Configuration
  notifications: {
    enabled: process.env.REACT_APP_CONTENT_NOTIFICATIONS_ENABLED !== 'false',
    duration: parseInt(process.env.REACT_APP_CONTENT_NOTIFICATION_DURATION) || 5000,
    position: process.env.REACT_APP_CONTENT_NOTIFICATION_POSITION || 'top-right',
    maxNotifications: parseInt(process.env.REACT_APP_CONTENT_NOTIFICATION_MAX) || 5,
  },

  // Error Handling Configuration
  errorHandling: {
    showUserFriendlyMessages: process.env.REACT_APP_CONTENT_USER_FRIENDLY_ERRORS !== 'false',
    logErrors: process.env.REACT_APP_CONTENT_LOG_ERRORS !== 'false',
    reportErrors: process.env.REACT_APP_CONTENT_REPORT_ERRORS === 'true',
    errorReportingUrl: process.env.REACT_APP_CONTENT_ERROR_REPORTING_URL || '',
  },
};

// Create hub-specific configuration manager
export const configManager = createHubConfigManager('content-hub', CONTENT_HUB_DEFAULTS);

// Export convenience functions
export const getConfig = () => configManager.getConfiguration();
export const updateConfig = (updates) => configManager.updateConfiguration(updates);
export const subscribeToConfig = (listener) => configManager.subscribe(listener);
export const resetConfig = () => configManager.resetToDefaults();
export const getConfigSection = (section) => configManager.getConfigurationSection(section);
export const updateConfigSection = (section, updates) => configManager.updateConfigurationSection(section, updates);
export const exportConfig = () => configManager.exportConfiguration();
export const importConfig = (json) => configManager.importConfiguration(json);

// Initialize configuration
configManager.loadConfiguration();