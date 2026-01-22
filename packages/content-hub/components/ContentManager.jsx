import React, { useRef, useEffect, useState } from 'react';
import ContentSharing from './ContentSharing';
import '../styles/ContentManager.css';

// Temporary mock Logger until @tamyla/shared is available
const Logger = {
  debug: (...args) => {
    // Mock implementation for development logging
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const log = window['console'] && window['console']['log'];
      if (log) log('[DEBUG]', ...args);
    }
  },
  error: (...args) => {
    // Mock implementation for error logging
    if (typeof window !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const error = window['console'] && window['console']['error'];
      if (error) error('[ERROR]', ...args);
    }
  },
  log: (...args) => {
    // Mock implementation for info logging
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const log = window['console'] && window['console']['log'];
      if (log) log('[INFO]', ...args);
    }
  }
};

/**
 * React wrapper for the Tamyla Content Manager Web Component
 * Dynamically loads the web component from the public directory
 * Enhanced with sharing and email blast capabilities
 */
export function ContentManager({
  apiBase = 'https://content.tamyla.com',
  selectionMode = false,
  showUpload = true,
  showGallery = true,
  showSearch = true,
  showSharing = true,
  maxFileSize = 25 * 1024 * 1024,
  authToken,
  currentUser,
  onContentUploaded,
  onAuthRequired,
  onError,
  onSearchChanged,
  onFilterChanged,
  onSelectionChanged,
  onContentShared,
  className,
  style,
  ...props
}) {
  // Use props for auth data instead of context
  const token = authToken;
  const user = currentUser;
  const componentRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showContentSharing, setShowContentSharing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Debug auth data in ContentManager
  useEffect(() => {
    Logger.debug('ContentManager auth data:', {
      hasCurrentUser: !!user,
      hasToken: !!token,
      tokenLength: token?.length,
      userEmail: currentUser?.email
    });
  }, [currentUser, token]);

  // Load the web component
  useEffect(() => {
    const loadComponent = () => {
      // Check if component is already loaded
      if (customElements.get('tamyla-content-manager')) {
        Logger.debug('✅ Content Manager already loaded');
        return;
      }

      // Load via script tag (production-safe approach)
      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${process.env.PUBLIC_URL || ''}/ui-components/content-manager-fixed.js?v=${Date.now()}`;
      script.onload = () => Logger.debug('✅ Content Manager web component loaded');
      script.onerror = (err) => {
        Logger.error('❌ Failed to load content manager component:', err);
        if (onError) onError(new Error('Failed to load content manager component'));
      };
      document.head.appendChild(script);
    };

    loadComponent();
  }, [onError]);

  // Configure the component when it's available
  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;

    // Set up event listeners
    const handleContentUploaded = (event) => {
      Logger.debug('Content uploaded event:', event.detail);
      if (onContentUploaded) onContentUploaded(event.detail);
    };

    const handleAuthRequired = (event) => {
      Logger.debug('Auth required event:', event.detail);
      if (onAuthRequired) onAuthRequired(event.detail);
    };

    const handleError = (event) => {
      Logger.error('Content manager error:', event.detail);
      if (onError) onError(event.detail);
    };

    const handleSearchChanged = (event) => {
      Logger.debug('Search changed:', event.detail);
      if (onSearchChanged) onSearchChanged(event.detail);
    };

    const handleFilterChanged = (event) => {
      Logger.debug('Filter changed:', event.detail);
      if (onFilterChanged) onFilterChanged(event.detail);
    };

    const handleSelectionChanged = (event) => {
      Logger.debug('Selection changed:', event.detail);
      setSelectedFiles(event.detail.selectedFiles || []);
      if (onSelectionChanged) onSelectionChanged(event.detail);
    };

    // Add event listeners
    component.addEventListener('contentUploaded', handleContentUploaded);
    component.addEventListener('authRequired', handleAuthRequired);
    component.addEventListener('error', handleError);
    component.addEventListener('searchChanged', handleSearchChanged);
    component.addEventListener('filterChanged', handleFilterChanged);
    component.addEventListener('selectionChanged', handleSelectionChanged);

    // Cleanup
    return () => {
      component.removeEventListener('contentUploaded', handleContentUploaded);
      component.removeEventListener('authRequired', handleAuthRequired);
      component.removeEventListener('error', handleError);
      component.removeEventListener('searchChanged', handleSearchChanged);
      component.removeEventListener('filterChanged', handleFilterChanged);
      component.removeEventListener('selectionChanged', handleSelectionChanged);
    };
  }, [onContentUploaded, onAuthRequired, onError, onSearchChanged, onFilterChanged, onSelectionChanged]);

  // Update component properties when they change
  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;

    // Set component properties
    Logger.debug('🔧 React setting component properties:', { apiBase, selectionMode, showUpload, showGallery, showSearch, maxFileSize });
    component.apiBase = apiBase;
    component.selectionMode = selectionMode;
    component.showUpload = showUpload;
    component.showGallery = showGallery;
    component.showSearch = showSearch;
    component.maxFileSize = maxFileSize;

    // Set authentication data
    if (currentUser && token) {
      Logger.debug('🔑 React setting auth data:', {
        hasCurrentUser: !!currentUser,
        hasToken: !!token,
        tokenLength: token?.length
      });
      component.authToken = token;
      component.currentUser = currentUser;
    } else {
      Logger.debug('🔑 React auth data missing:', {
        hasCurrentUser: !!currentUser,
        hasToken: !!token
      });
    }
  }, [apiBase, selectionMode, showUpload, showGallery, showSearch, maxFileSize, currentUser, token]);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleShareFiles = () => {
    if (selectedFiles.length === 0) {
      setNotification({ type: 'error', message: 'Please select files to share' });
      return;
    }
    setShowContentSharing(true);
  };

  const handleContentSharingSuccess = (result) => {
    setShowContentSharing(false);
    setNotification({
      type: 'success',
      message: result.message || 'Files shared successfully!'
    });
    onContentShared?.(result);
  };

  const handleContentSharingError = (error) => {
    setNotification({
      type: 'error',
      message: error.message || 'Failed to share files'
    });
    onError?.(error);
  };

  return (
    <div className={`content-manager-wrapper ${className || ''}`} style={style}>
      {/* Notification */}
      {notification && (
        <div className={`content-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Action Buttons */}
      {(showSharing) && (
        <div className="content-actions">
          {showSharing && (
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
        <ContentSharing
          selectedFiles={selectedFiles}
          authToken={token}
          currentUser={user}
          onClose={() => setShowContentSharing(false)}
          onSuccess={handleContentSharingSuccess}
          onError={handleContentSharingError}
        />
      )}
    </div>
  );
}

export default ContentManager;