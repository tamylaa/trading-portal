import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getConfig, subscribeToConfig, configManager } from './config';
import { createHubApiClient, createHubEventBus, EVENT_TYPES } from '@tamyla/shared';

/**
 * Contact Hub API Client
 */
export class ContactHubAPI {
  constructor(config = {}) {
    this.apiClient = createHubApiClient(configManager, config);
  }

  async checkHealth() {
    try {
      const response = await this.apiClient.get('/health');
      return response.data || response;
    } catch (error) {
      return { success: false, message: 'Contact service not available' };
    }
  }

  async getContacts(params = {}) {
    try {
      const response = await this.apiClient.get('/contacts', { params });
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  }

  async getContact(id) {
    try {
      const response = await this.apiClient.get(`/contacts/${id}`);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }
  }

  async createContact(contactData) {
    try {
      const response = await this.apiClient.post('/contacts', contactData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  async updateContact(id, contactData) {
    try {
      const response = await this.apiClient.put(`/contacts/${id}`, contactData);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }

  async deleteContact(id) {
    try {
      const response = await this.apiClient.delete(`/contacts/${id}`);
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  async importContacts(file, options = {}) {
    try {
      const response = await this.apiClient.upload('/contacts/import', file, null, {
        params: options
      });
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to import contacts: ${error.message}`);
    }
  }

  async exportContacts(format = 'csv', filters = {}) {
    try {
      const response = await this.apiClient.download('/contacts/export', `contacts.${format}`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to export contacts: ${error.message}`);
    }
  }

  async searchContacts(query, options = {}) {
    try {
      const response = await this.apiClient.get('/contacts/search', {
        params: { q: query, ...options }
      });
      return response.data || response;
    } catch (error) {
      throw new Error(`Failed to search contacts: ${error.message}`);
    }
  }
}

/**
 * Contact Hub Component
 */
export const ContactHub = (props) => {
  // Merge props with configuration
  const getMergedConfig = useCallback(() => {
    const defaultConfig = getConfig();
    return {
      // API settings
      apiBase: props.apiBase || defaultConfig.api.baseURL,

      // UI settings
      showContactList: props.showContactList !== undefined ? props.showContactList : defaultConfig.ui.showContactList,
      showContactForm: props.showContactForm !== undefined ? props.showContactForm : defaultConfig.ui.showContactForm,
      showSearch: props.showSearch !== undefined ? props.showSearch : defaultConfig.ui.showSearch,
      showFilters: props.showFilters !== undefined ? props.showFilters : defaultConfig.ui.showFilters,
      showImport: props.showImport !== undefined ? props.showImport : defaultConfig.ui.showImport,
      showExport: props.showExport !== undefined ? props.showExport : defaultConfig.ui.showExport,

      // Behavior settings
      defaultView: props.defaultView || defaultConfig.behavior.defaultView,
      itemsPerPage: props.itemsPerPage || defaultConfig.behavior.itemsPerPage,
      enableContactValidation: props.enableContactValidation !== undefined ? props.enableContactValidation : defaultConfig.behavior.enableContactValidation,
      autoSave: props.autoSave !== undefined ? props.autoSave : defaultConfig.behavior.autoSave,

      // Feature flags
      enableBulkActions: props.enableBulkActions !== undefined ? props.enableBulkActions : defaultConfig.ui.enableBulkActions,
      enableKeyboardShortcuts: props.enableKeyboardShortcuts !== undefined ? props.enableKeyboardShortcuts : defaultConfig.ui.enableKeyboardShortcuts,

      // Event handlers
      onContactCreated: props.onContactCreated,
      onContactUpdated: props.onContactUpdated,
      onContactDeleted: props.onContactDeleted,
      onContactImported: props.onContactImported,
      onContactExported: props.onContactExported,
      onSearchChanged: props.onSearchChanged,
      onFilterChanged: props.onFilterChanged,
      onBulkAction: props.onBulkAction,
      onError: props.onError,

      // Styling
      className: props.className || defaultConfig.styling.componentClassName,
      style: props.style,

      // Other props
      ...props
    };
  }, [props]);

  const [config, setConfig] = useState(getMergedConfig);
  const [loading, setLoading] = useState(false);
  const [selectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const componentRef = useRef(null);
  const [api] = useState(() => new ContactHubAPI({ baseURL: config.apiBase }));
  const [eventBus] = useState(() => createHubEventBus('contact-hub'));

  // Memoize error handler to avoid dependency issues
  const onError = useCallback((error) => {
    if (config.onError) config.onError(error);
  }, [config]);

  // Subscribe to configuration changes
  useEffect(() => {
    const unsubscribe = subscribeToConfig(() => {
      setConfig(getMergedConfig());
    });

    return unsubscribe;
  }, [getMergedConfig]);

  // Update config when props change
  useEffect(() => {
    setConfig(getMergedConfig());
  }, [getMergedConfig]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      await api.getContacts({
        search: searchQuery,
        limit: config.itemsPerPage
      });
      // Note: contacts state removed as it was unused
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load contacts'
      });
    } finally {
      setLoading(false);
    }
  }, [api, searchQuery, config.itemsPerPage]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Load the web component
  useEffect(() => {
    const loadComponent = () => {
      const webComponentConfig = getConfig().integrations.webComponent;

      if (!webComponentConfig.enabled) {
        console.log('Contact Hub web component disabled in configuration');
        return;
      }

      if (customElements.get(webComponentConfig.elementName)) {
        console.log('✅ Contact Manager already loaded');
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${process.env.PUBLIC_URL || ''}${webComponentConfig.scriptUrl}?v=${Date.now()}`;
      script.onload = () => console.log('✅ Contact Manager web component loaded');
      script.onerror = (err) => {
        console.error('❌ Failed to load contact manager component:', err);
        onError(new Error('Failed to load contact manager component'));
      };
      document.head.appendChild(script);
    };

    loadComponent();
  }, [onError]);

  // Configure the component when it's available
  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;

    // Set up event listeners based on configuration
    const eventConfig = getConfig().events;

    const handleContactCreated = (event) => {
      if (!eventConfig.enableContactCreated) return;
      console.log('Contact created event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:created', event.detail, { source: 'contact-hub' });
      // Call prop handler for backward compatibility
      if (config.onContactCreated) config.onContactCreated(event.detail);
    };

    const handleContactUpdated = (event) => {
      if (!eventConfig.enableContactUpdated) return;
      console.log('Contact updated event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:updated', event.detail, { source: 'contact-hub' });
      // Call prop handler for backward compatibility
      if (config.onContactUpdated) config.onContactUpdated(event.detail);
    };

    const handleContactDeleted = (event) => {
      if (!eventConfig.enableContactDeleted) return;
      console.log('Contact deleted event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:deleted', event.detail, { source: 'contact-hub' });
      // Call prop handler for backward compatibility
      if (config.onContactDeleted) config.onContactDeleted(event.detail);
    };

    const handleError = (event) => {
      if (!eventConfig.enableError) return;
      console.error('Contact manager error:', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.ERROR, event.detail, { source: 'contact-hub' });
      // Call prop handler for backward compatibility
      if (config.onError) config.onError(event.detail);
    };

    // Add event listeners
    component.addEventListener('contact-created', handleContactCreated);
    component.addEventListener('contact-updated', handleContactUpdated);
    component.addEventListener('contact-deleted', handleContactDeleted);
    component.addEventListener('error', handleError);

    return () => {
      // Clean up event listeners
      component.removeEventListener('contact-created', handleContactCreated);
      component.removeEventListener('contact-updated', handleContactUpdated);
      component.removeEventListener('contact-deleted', handleContactDeleted);
      component.removeEventListener('error', handleError);
    };
  }, [config, eventBus]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (config.onSearchChanged) config.onSearchChanged(query);
    eventBus.emit('contact:searchChanged', { query }, { source: 'contact-hub' });
  };

  const handleBulkAction = (action, contactIds) => {
    if (config.onBulkAction) config.onBulkAction(action, contactIds);
    eventBus.emit('contact:bulkAction', { action, contactIds }, { source: 'contact-hub' });
  };

  return (
    <div className={`contact-hub-wrapper ${config.className}`} style={config.style}>
      {/* Notification */}
      {notification && (
        <div className={`${getConfig().styling.notificationClassName} ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Search and Filters */}
      {config.showSearch && (
        <div className="contact-search">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="contact-search-input"
          />
        </div>
      )}

      {config.showFilters && (
        <div className="contact-filters">
          {/* Filter controls would go here */}
        </div>
      )}

      {/* Bulk Actions */}
      {config.enableBulkActions && selectedContacts.length > 0 && (
        <div className="contact-bulk-actions">
          <button
            onClick={() => handleBulkAction('delete', selectedContacts)}
            className="bulk-delete-btn"
          >
            Delete Selected ({selectedContacts.length})
          </button>
          <button
            onClick={() => handleBulkAction('export', selectedContacts)}
            className="bulk-export-btn"
          >
            Export Selected ({selectedContacts.length})
          </button>
        </div>
      )}

      {/* Contact Manager Web Component */}
      <tamyla-contact-manager
        ref={componentRef}
        api-base-url={config.apiBase}
        show-list={config.showContactList}
        show-form={config.showContactForm}
        show-import={config.showImport}
        show-export={config.showExport}
        default-view={config.defaultView}
        items-per-page={config.itemsPerPage}
        enable-validation={config.enableContactValidation}
        auto-save={config.autoSave}
        {...props}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="contact-loading">
          Loading contacts...
        </div>
      )}
    </div>
  );
};

export default ContactHub;