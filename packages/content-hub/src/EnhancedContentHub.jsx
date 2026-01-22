/**
 * Enhanced Content Hub - Shared Infrastructure Compliant
 * 
 * Uses @tamyla/shared infrastructure to eliminate code duplication:
 * - SharedContentHubService (replaces custom services)
 * - EventBus (replaces ContentHubEventManager)
 * - Logger (replaces console.* calls)
 * - ErrorHandler (standardized error handling)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabbedLayout, SidebarLayout, SingleViewLayout } from './layouts';
import { SharedContentHubService } from './services/SharedContentHubService';
import { Logger, ErrorHandler } from '@tamyla/shared/utils';
import './styles/ContentHub.css';

// Initialize shared services
const contentHubService = new SharedContentHubService();
const logger = new Logger('EnhancedContentHub');
const errorHandler = new ErrorHandler({ component: 'EnhancedContentHub' });

/**
 * Main Content Hub Component
 * - Uses shared infrastructure exclusively
 * - No duplicate event management or API clients
 * - Proper error handling and logging
 */
const EnhancedContentHub = ({ 
  initialLayout = 'tabbed',
  enableAdvancedSearch = true,
  enableUpload = true,
  enableRealTimeUpdates = true,
  onContentSelected = null,
  onSearchResults = null,
  customFilters = {},
  className = '',
  style = {}
}) => {
  // State management
  const [layout, setLayout] = useState(initialLayout);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [filters, setFilters] = useState(customFilters);
  const [searchHistory, setSearchHistory] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [healthStatus, setHealthStatus] = useState({ status: 'unknown' });
  const [error, setError] = useState(null);

  // Refs for cleanup
  const searchTimeoutRef = useRef(null);
  const eventUnsubscribers = useRef([]);

  // Setup event listeners using shared EventBus
  useEffect(() => {
    logger.info('Initializing Enhanced Content Hub', { layout, enableAdvancedSearch });

    // Subscribe to search events
    const unsubscribeSearch = contentHubService.on('search:completed', (event) => {
      logger.debug('Search completed', { 
        query: event.query, 
        resultCount: event.results?.length || 0 
      });
      setSearchResults(event.results || []);
      setIsLoading(false);
      onSearchResults?.(event.results);
    });

    const unsubscribeSearchFailed = contentHubService.on('search:failed', (event) => {
      logger.error('Search failed', { query: event.query, error: event.error });
      const handledError = errorHandler.handle(new Error(event.error));
      setError(handledError.message);
      setIsLoading(false);
    });

    // Subscribe to upload events
    const unsubscribeUploadProgress = contentHubService.on('upload:progress', (event) => {
      setUploadProgress(event.progress);
    });

    const unsubscribeUploadCompleted = contentHubService.on('upload:completed', (event) => {
      logger.info('Upload completed', { fileCount: event.fileCount });
      setUploadProgress(0);
      // Refresh search results
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    });

    const unsubscribeUploadFailed = contentHubService.on('upload:failed', (event) => {
      logger.error('Upload failed', { error: event.error });
      const handledError = errorHandler.handle(new Error(event.error));
      setError(handledError.message);
      setUploadProgress(0);
    });

    // Subscribe to health checks
    const unsubscribeHealth = contentHubService.on('service:health_check', (event) => {
      setHealthStatus(event);
    });

    // Store unsubscribers for cleanup
    eventUnsubscribers.current = [
      unsubscribeSearch,
      unsubscribeSearchFailed,
      unsubscribeUploadProgress,
      unsubscribeUploadCompleted,
      unsubscribeUploadFailed,
      unsubscribeHealth
    ];

    // Initial health check
    contentHubService.checkHealth().catch(error => {
      logger.warn('Initial health check failed', error);
    });

    return () => {
      // Cleanup event subscriptions
      eventUnsubscribers.current.forEach(unsubscribe => unsubscribe?.());
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      logger.info('Enhanced Content Hub cleanup completed');
    };
  }, [layout, enableAdvancedSearch, onSearchResults]);

  // Search handler using shared service
  const handleSearch = useCallback(async (query, additionalFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Clear previous search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        logger.debug('Starting search', { query, filters: { ...filters, ...additionalFilters } });
        
        // Use shared service for search
        await contentHubService.search(query, { 
          ...filters, 
          ...additionalFilters 
        });

        // Update search history
        setSearchHistory(prev => {
          const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
          return newHistory;
        });

      } catch (error) {
        logger.error('Search error', error);
        const handledError = errorHandler.handle(error);
        setError(handledError.message);
        setIsLoading(false);
      }
    }, 300);
  }, [filters]);

  // Upload handler using shared service
  const handleUpload = useCallback(async (files) => {
    if (!enableUpload || !files?.length) {
      return;
    }

    try {
      logger.info('Starting file upload', { fileCount: files.length });
      setError(null);
      
      // Use shared service for upload
      const results = await contentHubService.upload(files, {
        metadata: {
          uploadedBy: 'content-hub',
          timestamp: new Date().toISOString()
        }
      });

      logger.info('Upload successful', { results });
      return results;

    } catch (error) {
      logger.error('Upload error', error);
      const handledError = errorHandler.handle(error);
      setError(handledError.message);
      throw handledError;
    }
  }, [enableUpload]);

  // Content selection handler
  const handleContentSelect = useCallback((content) => {
    logger.debug('Content selected', { contentId: content?.id });
    setSelectedContent(content);
    onContentSelected?.(content);
  }, [onContentSelected]);

  // Layout switcher
  const handleLayoutChange = useCallback((newLayout) => {
    logger.debug('Layout changed', { from: layout, to: newLayout });
    setLayout(newLayout);
  }, [layout]);

  // Clear error
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  // Render appropriate layout
  const renderLayout = () => {
    const commonProps = {
      searchQuery,
      onSearchQueryChange: setSearchQuery,
      onSearch: handleSearch,
      searchResults,
      isLoading,
      selectedContent,
      onContentSelect: handleContentSelect,
      onUpload: enableUpload ? handleUpload : undefined,
      uploadProgress,
      filters,
      onFiltersChange: setFilters,
      searchHistory,
      healthStatus,
      error,
      onClearError: handleClearError,
      enableAdvancedSearch,
      enableRealTimeUpdates
    };

    switch (layout) {
      case 'sidebar':
        return <SidebarLayout {...commonProps} />;
      case 'single':
        return <SingleViewLayout {...commonProps} />;
      case 'tabbed':
      default:
        return <TabbedLayout {...commonProps} />;
    }
  };

  return (
    <div 
      className={`enhanced-content-hub ${layout}-layout ${className}`}
      style={style}
    >
      {/* Layout switcher */}
      <div className="layout-controls">
        <button
          className={`layout-btn ${layout === 'tabbed' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('tabbed')}
          title="Tabbed Layout"
        >
          Tabs
        </button>
        <button
          className={`layout-btn ${layout === 'sidebar' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('sidebar')}
          title="Sidebar Layout"
        >
          Sidebar
        </button>
        <button
          className={`layout-btn ${layout === 'single' ? 'active' : ''}`}
          onClick={() => handleLayoutChange('single')}
          title="Single View"
        >
          Single
        </button>
      </div>

      {/* Health status indicator */}
      <div className={`health-status ${healthStatus.status}`}>
        <span className="status-indicator" title={`Service Status: ${healthStatus.status}`} />
      </div>

      {/* Main layout content */}
      <div className="content-hub-main">
        {renderLayout()}
      </div>
    </div>
  );
};

export default EnhancedContentHub;

// Export shared service for external access
export { contentHubService as ContentHubService };

// Export event subscription helper
export const subscribeToContentHubEvents = (eventType, callback, options) => {
  logger.debug('External event subscription', { eventType });
  return contentHubService.on(eventType, callback, options);
};

// Export search function for external use
export const searchContent = async (query, filters = {}) => {
  logger.debug('External search request', { query, filters });
  return contentHubService.search(query, filters);
};

// Export upload function for external use
export const uploadContent = async (files, options = {}) => {
  logger.debug('External upload request', { fileCount: files?.length });
  return contentHubService.upload(files, options);
};