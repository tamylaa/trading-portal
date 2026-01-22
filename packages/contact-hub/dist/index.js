"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ContactHubAPI = exports.ContactHub = void 0;
var _react = _interopRequireWildcard(require("react"));
var _config = require("./config");
var _shared = require("@tamyla/shared");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Contact Hub API Client
 */
class ContactHubAPI {
  constructor() {
    let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.apiClient = (0, _shared.createHubApiClient)(_config.configManager, config);
  }
  async checkHealth() {
    try {
      const response = await this.apiClient.get('/health');
      return response.data || response;
    } catch (error) {
      return {
        success: false,
        message: 'Contact service not available'
      };
    }
  }
  async getContacts() {
    let params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    try {
      const response = await this.apiClient.get('/contacts', {
        params
      });
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to fetch contacts: ".concat(error.message));
    }
  }
  async getContact(id) {
    try {
      const response = await this.apiClient.get("/contacts/".concat(id));
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to fetch contact: ".concat(error.message));
    }
  }
  async createContact(contactData) {
    try {
      const response = await this.apiClient.post('/contacts', contactData);
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to create contact: ".concat(error.message));
    }
  }
  async updateContact(id, contactData) {
    try {
      const response = await this.apiClient.put("/contacts/".concat(id), contactData);
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to update contact: ".concat(error.message));
    }
  }
  async deleteContact(id) {
    try {
      const response = await this.apiClient.delete("/contacts/".concat(id));
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to delete contact: ".concat(error.message));
    }
  }
  async importContacts(file) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    try {
      const response = await this.apiClient.upload('/contacts/import', file, null, {
        params: options
      });
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to import contacts: ".concat(error.message));
    }
  }
  async exportContacts() {
    let format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'csv';
    let filters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    try {
      const response = await this.apiClient.download('/contacts/export', "contacts.".concat(format), {
        params: _objectSpread({
          format
        }, filters),
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error("Failed to export contacts: ".concat(error.message));
    }
  }
  async searchContacts(query) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    try {
      const response = await this.apiClient.get('/contacts/search', {
        params: _objectSpread({
          q: query
        }, options)
      });
      return response.data || response;
    } catch (error) {
      throw new Error("Failed to search contacts: ".concat(error.message));
    }
  }
}

/**
 * Contact Hub Component
 */
exports.ContactHubAPI = ContactHubAPI;
const ContactHub = props => {
  // Merge props with configuration
  const getMergedConfig = (0, _react.useCallback)(() => {
    const defaultConfig = (0, _config.getConfig)();
    return _objectSpread({
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
      style: props.style
    }, props);
  }, [props]);
  const [config, setConfig] = (0, _react.useState)(getMergedConfig);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [selectedContacts] = (0, _react.useState)([]);
  const [searchQuery, setSearchQuery] = (0, _react.useState)('');
  const [notification, setNotification] = (0, _react.useState)(null);
  const componentRef = (0, _react.useRef)(null);
  const [api] = (0, _react.useState)(() => new ContactHubAPI({
    baseURL: config.apiBase
  }));
  const [eventBus] = (0, _react.useState)(() => (0, _shared.createHubEventBus)('contact-hub'));

  // Memoize error handler to avoid dependency issues
  const onError = (0, _react.useCallback)(error => {
    if (config.onError) config.onError(error);
  }, [config]);

  // Subscribe to configuration changes
  (0, _react.useEffect)(() => {
    const unsubscribe = (0, _config.subscribeToConfig)(() => {
      setConfig(getMergedConfig());
    });
    return unsubscribe;
  }, [getMergedConfig]);

  // Update config when props change
  (0, _react.useEffect)(() => {
    setConfig(getMergedConfig());
  }, [getMergedConfig]);
  const loadContacts = (0, _react.useCallback)(async () => {
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
  (0, _react.useEffect)(() => {
    loadContacts();
  }, [loadContacts]);

  // Load the web component
  (0, _react.useEffect)(() => {
    const loadComponent = () => {
      const webComponentConfig = (0, _config.getConfig)().integrations.webComponent;
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
      script.src = "".concat(process.env.PUBLIC_URL || '').concat(webComponentConfig.scriptUrl, "?v=").concat(Date.now());
      script.onload = () => console.log('✅ Contact Manager web component loaded');
      script.onerror = err => {
        console.error('❌ Failed to load contact manager component:', err);
        onError(new Error('Failed to load contact manager component'));
      };
      document.head.appendChild(script);
    };
    loadComponent();
  }, [onError]);

  // Configure the component when it's available
  (0, _react.useEffect)(() => {
    const component = componentRef.current;
    if (!component) return;

    // Set up event listeners based on configuration
    const eventConfig = (0, _config.getConfig)().events;
    const handleContactCreated = event => {
      if (!eventConfig.enableContactCreated) return;
      console.log('Contact created event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:created', event.detail, {
        source: 'contact-hub'
      });
      // Call prop handler for backward compatibility
      if (config.onContactCreated) config.onContactCreated(event.detail);
    };
    const handleContactUpdated = event => {
      if (!eventConfig.enableContactUpdated) return;
      console.log('Contact updated event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:updated', event.detail, {
        source: 'contact-hub'
      });
      // Call prop handler for backward compatibility
      if (config.onContactUpdated) config.onContactUpdated(event.detail);
    };
    const handleContactDeleted = event => {
      if (!eventConfig.enableContactDeleted) return;
      console.log('Contact deleted event:', event.detail);
      // Emit through shared event bus
      eventBus.emit('contact:deleted', event.detail, {
        source: 'contact-hub'
      });
      // Call prop handler for backward compatibility
      if (config.onContactDeleted) config.onContactDeleted(event.detail);
    };
    const handleError = event => {
      if (!eventConfig.enableError) return;
      console.error('Contact manager error:', event.detail);
      // Emit through shared event bus
      eventBus.emit(_shared.EVENT_TYPES.ERROR, event.detail, {
        source: 'contact-hub'
      });
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
  const handleSearch = query => {
    setSearchQuery(query);
    if (config.onSearchChanged) config.onSearchChanged(query);
    eventBus.emit('contact:searchChanged', {
      query
    }, {
      source: 'contact-hub'
    });
  };
  const handleBulkAction = (action, contactIds) => {
    if (config.onBulkAction) config.onBulkAction(action, contactIds);
    eventBus.emit('contact:bulkAction', {
      action,
      contactIds
    }, {
      source: 'contact-hub'
    });
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "contact-hub-wrapper ".concat(config.className),
    style: config.style
  }, notification && /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _config.getConfig)().styling.notificationClassName, " ").concat(notification.type)
  }, /*#__PURE__*/_react.default.createElement("span", null, notification.message), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => setNotification(null)
  }, "\xD7")), config.showSearch && /*#__PURE__*/_react.default.createElement("div", {
    className: "contact-search"
  }, /*#__PURE__*/_react.default.createElement("input", {
    type: "text",
    placeholder: "Search contacts...",
    value: searchQuery,
    onChange: e => handleSearch(e.target.value),
    className: "contact-search-input"
  })), config.showFilters && /*#__PURE__*/_react.default.createElement("div", {
    className: "contact-filters"
  }), config.enableBulkActions && selectedContacts.length > 0 && /*#__PURE__*/_react.default.createElement("div", {
    className: "contact-bulk-actions"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => handleBulkAction('delete', selectedContacts),
    className: "bulk-delete-btn"
  }, "Delete Selected (", selectedContacts.length, ")"), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => handleBulkAction('export', selectedContacts),
    className: "bulk-export-btn"
  }, "Export Selected (", selectedContacts.length, ")")), /*#__PURE__*/_react.default.createElement("tamyla-contact-manager", _extends({
    ref: componentRef,
    "api-base-url": config.apiBase,
    "show-list": config.showContactList,
    "show-form": config.showContactForm,
    "show-import": config.showImport,
    "show-export": config.showExport,
    "default-view": config.defaultView,
    "items-per-page": config.itemsPerPage,
    "enable-validation": config.enableContactValidation,
    "auto-save": config.autoSave
  }, props)), loading && /*#__PURE__*/_react.default.createElement("div", {
    className: "contact-loading"
  }, "Loading contacts..."));
};
exports.ContactHub = ContactHub;
var _default = exports.default = ContactHub;