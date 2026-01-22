import React, { useRef, useEffect, useState } from 'react';
import { getConfig, updateConfig, subscribeToConfig, configManager } from './config';
import { createHubApiClient, createHubEventBus, EVENT_TYPES } from '@tamyla/shared';
import { Logger } from '@tamyla/shared/utils';
import { contentApi } from '../api/content';

// Initialize logger
const logger = new Logger('ContentHub');

// Content Hub React Component
export const ContentHub = (props) => {
  // Merge props with configuration
  const getMergedConfig = () => {
    const defaultConfig = getConfig();
    return {
      // API settings
      apiBase: props.apiBase || defaultConfig.api.baseURL,

      // UI settings
      showUpload: props.showUpload !== undefined ? props.showUpload : defaultConfig.ui.showUpload,
      showGallery: props.showGallery !== undefined ? props.showGallery : defaultConfig.ui.showGallery,
      showSearch: props.showSearch !== undefined ? props.showSearch : defaultConfig.ui.showSearch,
      showSharing: props.showSharing !== undefined ? props.showSharing : defaultConfig.ui.showSharing,
      showFilters: props.showFilters !== undefined ? props.showFilters : defaultConfig.ui.showFilters,
      showBulkActions: props.showBulkActions !== undefined ? props.showBulkActions : defaultConfig.ui.showBulkActions,

      // Behavior settings
      selectionMode: props.selectionMode !== undefined ? props.selectionMode : defaultConfig.behavior.selectionMode,
      multiSelect: props.multiSelect !== undefined ? props.multiSelect : defaultConfig.behavior.multiSelect,
      maxFileSize: props.maxFileSize || defaultConfig.behavior.maxFileSize,
      allowedFileTypes: props.allowedFileTypes || defaultConfig.behavior.allowedFileTypes,
      maxFilesPerUpload: props.maxFilesPerUpload || defaultConfig.behavior.maxFileSize,

      // Feature flags
      enableDragDrop: props.enableDragDrop !== undefined ? props.enableDragDrop : defaultConfig.ui.enableDragDrop,
      enableKeyboardShortcuts: props.enableKeyboardShortcuts !== undefined ? props.enableKeyboardShortcuts : defaultConfig.ui.enableKeyboardShortcuts,
      enableFilePreview: props.enableFilePreview !== undefined ? props.enableFilePreview : defaultConfig.behavior.enableFilePreview,

      // Event handlers
      onContentUploaded: props.onContentUploaded,
      onAuthRequired: props.onAuthRequired,
      onError: props.onError,
      onSearchChanged: props.onSearchChanged,
      onFilterChanged: props.onFilterChanged,
      onSelectionChanged: props.onSelectionChanged,
      onContentShared: props.onContentShared,

      // Styling
      className: props.className || defaultConfig.styling.componentClassName,
      style: props.style,

      // Other props
      ...props
    };
  };

  const [config, setConfig] = useState(getMergedConfig);
  const componentRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showContentSharing, setShowContentSharing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [api] = useState(() => new ContentHubAPI({ baseURL: config.apiBase }));
  const [eventBus] = useState(() => createHubEventBus('content-hub'));

  // Subscribe to configuration changes
  useEffect(() => {
    const unsubscribe = subscribeToConfig(() => {
      setConfig(getMergedConfig());
    });

    return unsubscribe;
  }, []);

  // Update config when props change
  useEffect(() => {
    setConfig(getMergedConfig());
  }, [props]);

  // Load the web component
  useEffect(() => {
    const loadComponent = () => {
      const webComponentConfig = getConfig().integrations.webComponent;

      if (!webComponentConfig.enabled) {
        logger.debug('Web component disabled in configuration');
        return;
      }

      if (customElements.get(webComponentConfig.elementName)) {
        logger.debug('Content Manager already loaded');
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${process.env.PUBLIC_URL || ''}${webComponentConfig.scriptUrl}?v=${Date.now()}`;
      script.onload = () => logger.debug('Content Manager web component loaded');
      script.onerror = (err) => {
        logger.error('Failed to load content manager component', err);
        if (config.onError) config.onError(new Error('Failed to load content manager component'));
      };
      document.head.appendChild(script);
    };

    loadComponent();
  }, [config.onError]);

  // Configure the component when it's available
  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;

    // Set up event listeners based on configuration
    const eventConfig = getConfig().events;

    const handleContentUploaded = (event) => {
      if (!eventConfig.enableContentUploaded) return;
      logger.debug('Content uploaded event', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.DATA_UPDATE, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onContentUploaded) config.onContentUploaded(event.detail);
    };

    const handleAuthRequired = (event) => {
      if (!eventConfig.enableAuthRequired) return;
      logger.debug('Auth required event', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.AUTH_ERROR, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onAuthRequired) config.onAuthRequired(event.detail);
    };

    const handleError = (event) => {
      if (!eventConfig.enableError) return;
      logger.debug('Error event', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.ERROR, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onError) config.onError(event.detail);
    };

    const handleSearchChanged = (event) => {
      if (!eventConfig.enableSearchChanged) return;
      logger.debug('Search changed event', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.SEARCH_UPDATE, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onSearchChanged) config.onSearchChanged(event.detail);
    };

    const handleFilterChanged = (event) => {
      if (!eventConfig.enableFilterChanged) return;
      logger.debug('Filter changed event', event.detail);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.FILTER_UPDATE, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onFilterChanged) config.onFilterChanged(event.detail);
    };

    const handleSelectionChanged = (event) => {
      if (!eventConfig.enableSelectionChanged) return;
      logger.debug('Selection changed event', event.detail);
      setSelectedFiles(event.detail.selectedFiles || []);
      // Emit through shared event bus
      eventBus.emit(EVENT_TYPES.SELECTION_UPDATE, event.detail, { source: 'content-hub' });
      // Call prop handler for backward compatibility
      if (config.onSelectionChanged) config.onSelectionChanged(event.detail);
    };

    // Attach event listeners
    component.addEventListener('content-uploaded', handleContentUploaded);
    component.addEventListener('auth-required', handleAuthRequired);
    component.addEventListener('error', handleError);
    component.addEventListener('search-changed', handleSearchChanged);
    component.addEventListener('filter-changed', handleFilterChanged);
    component.addEventListener('selection-changed', handleSelectionChanged);

    // Configure the component
    component.apiBase = config.apiBase;
    component.showUpload = config.showUpload;
    component.showGallery = config.showGallery;
    component.showSearch = config.showSearch;
    component.showFilters = config.showFilters;
    component.selectionMode = config.selectionMode;
    component.multiSelect = config.multiSelect;
    component.maxFileSize = config.maxFileSize;
    component.allowedFileTypes = config.allowedFileTypes;
    component.maxFilesPerUpload = config.maxFilesPerUpload;
    component.enableDragDrop = config.enableDragDrop;
    component.enableKeyboardShortcuts = config.enableKeyboardShortcuts;
    component.enableFilePreview = config.enableFilePreview;

    return () => {
      // Clean up event listeners
      component.removeEventListener('content-uploaded', handleContentUploaded);
      component.removeEventListener('auth-required', handleAuthRequired);
      component.removeEventListener('error', handleError);
      component.removeEventListener('search-changed', handleSearchChanged);
      component.removeEventListener('filter-changed', handleFilterChanged);
      component.removeEventListener('selection-changed', handleSelectionChanged);
    };
  }, [config, eventBus]);

  const handleShareFiles = () => {
    if (selectedFiles.length === 0) return;
    setShowContentSharing(true);
  };

  const handleContentSharingSuccess = (result) => {
    setShowContentSharing(false);
    setNotification({
      type: 'success',
      message: result.message || 'Files shared successfully'
    });
    if (config.onContentShared) config.onContentShared(result);
  };

  const handleContentSharingError = (error) => {
    setNotification({
      type: 'error',
      message: error.message || 'Failed to share files'
    });
    if (config.onError) config.onError(error);
  };

  return (
    <div className={`content-hub-wrapper ${config.className}`} style={config.style}>
      {/* Notification */}
      {notification && (
        <div className={`${getConfig().styling.notificationClassName} ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Action Buttons */}
      {config.showSharing && (
        <div className="content-actions">
          {config.showBulkActions && (
            <button
              onClick={handleShareFiles}
              disabled={selectedFiles.length === 0}
              className="share-files-btn"
              title="Share selected files via email"
            >
              📧 Share Files ({selectedFiles.length})
            </button>
          )}
        </div>
      )}

      {/* Content Manager Web Component */}
      <tamyla-content-manager
        ref={componentRef}
        {...props}
      />

      {/* Modals */}
      {showContentSharing && (
        <div className="content-sharing-modal">
          <div className="modal-content">
            <h3>Share Files</h3>
            <p>Selected {selectedFiles.length} files for sharing</p>
            <div className="modal-actions">
              <button onClick={() => setShowContentSharing(false)}>Cancel</button>
              <button onClick={() => handleContentSharingSuccess({ message: 'Files shared successfully' })}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentHub;