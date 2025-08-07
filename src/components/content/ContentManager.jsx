import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ContentSharing from './ContentSharing';
import EmailBlaster from './EmailBlaster';
import './ContentManager.css';

/**
 * React wrapper for the Tamyla Content Manager Web Component
 * Dynamically loads the web component from the public directory
 * Enhanced with sharing and email blast capabilities
 */
export function ContentManager({
  apiBase = '/api/content',
  selectionMode = false,
  showUpload = true,
  showGallery = true,
  showSearch = true,
  showSharing = true,
  maxFileSize = 25 * 1024 * 1024,
  onContentUploaded,
  onAuthRequired,
  onError,
  onSearchChanged,
  onFilterChanged,
  onSelectionChanged,
  onContentShared,
  onCampaignSent,
  className,
  style,
  ...props
}) {
  const { currentUser, token } = useAuth();
  const componentRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showContentSharing, setShowContentSharing] = useState(false);
  const [showEmailBlaster, setShowEmailBlaster] = useState(false);
  const [notification, setNotification] = useState(null);

  // Debug auth data in ContentManager
  useEffect(() => {
    console.log('ContentManager auth data:', { 
      hasCurrentUser: !!currentUser, 
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
        console.log('✅ Content Manager already loaded');
        return;
      }

      // Load via script tag (production-safe approach)
      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${process.env.PUBLIC_URL || ''}/ui-components/content-manager-fixed.js?v=${Date.now()}`;
      script.onload = () => console.log('✅ Content Manager web component loaded');
      script.onerror = (err) => {
        console.error('❌ Failed to load content manager component:', err);
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
      console.log('Content uploaded event:', event.detail);
      if (onContentUploaded) onContentUploaded(event.detail);
    };

    const handleAuthRequired = (event) => {
      console.log('Auth required event:', event.detail);
      if (onAuthRequired) onAuthRequired(event.detail);
    };

    const handleError = (event) => {
      console.error('Content manager error:', event.detail);
      if (onError) onError(event.detail);
    };

    const handleSearchChanged = (event) => {
      console.log('Search changed:', event.detail);
      if (onSearchChanged) onSearchChanged(event.detail);
    };

    const handleFilterChanged = (event) => {
      console.log('Filter changed:', event.detail);
      if (onFilterChanged) onFilterChanged(event.detail);
    };

    const handleSelectionChanged = (event) => {
      console.log('Selection changed:', event.detail);
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
    console.log('🔧 React setting component properties:', { apiBase, selectionMode, showUpload, showGallery, showSearch, maxFileSize });
    component.apiBase = apiBase;
    component.selectionMode = selectionMode;
    component.showUpload = showUpload;
    component.showGallery = showGallery;
    component.showSearch = showSearch;
    component.maxFileSize = maxFileSize;

    // Set authentication data
    if (currentUser && token) {
      console.log('🔑 React setting auth data:', { 
        hasCurrentUser: !!currentUser, 
        hasToken: !!token, 
        tokenLength: token?.length 
      });
      component.authToken = token;
      component.currentUser = currentUser;
    } else {
      console.log('🔑 React auth data missing:', { 
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

  const handleEmailBlaster = () => {
    setShowEmailBlaster(true);
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

  const handleEmailBlasterSuccess = (result) => {
    setShowEmailBlaster(false);
    setNotification({ 
      type: 'success', 
      message: result.message || 'Campaign sent successfully!'
    });
    onCampaignSent?.(result);
  };

  const handleEmailBlasterError = (error) => {
    setNotification({ 
      type: 'error', 
      message: error.message || 'Failed to send campaign'
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
      {(showSharing || showEmailBlaster) && (
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
          {showEmailBlaster && (
            <button
              onClick={handleEmailBlaster}
              className="email-blaster-btn"
              title="Create email campaign"
            >
              📢 Email Campaign
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
          onClose={() => setShowContentSharing(false)}
          onSuccess={handleContentSharingSuccess}
          onError={handleContentSharingError}
        />
      )}

      {showEmailBlaster && (
        <EmailBlaster
          onClose={() => setShowEmailBlaster(false)}
          onSuccess={handleEmailBlasterSuccess}
          onError={handleEmailBlasterError}
        />
      )}
    </div>
  );
}

export default ContentManager;
