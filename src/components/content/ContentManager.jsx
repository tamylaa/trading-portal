import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * React wrapper for the Tamyla Content Manager Web Component
 * Dynamically loads the web component from the public directory
 */
export function ContentManager({
  apiBase = '/api/content',
  selectionMode = false,
  showUpload = true,
  showGallery = true,
  showSearch = true,
  maxFileSize = 25 * 1024 * 1024,
  onContentUploaded,
  onAuthRequired,
  onError,
  onSearchChanged,
  onFilterChanged,
  onSelectionChanged,
  className,
  style,
  ...props
}) {
  const { currentUser, token } = useAuth();
  const componentRef = useRef(null);

  // Load the web component
  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Dynamically import the web component from public directory
        await import('/ui-components/content-manager.js');
        console.log('✅ Content Manager web component loaded');
      } catch (error) {
        console.error('❌ Failed to load content manager component:', error);
        console.error('Trying alternative approach...');
        
        // Fallback: Load via script tag
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/ui-components/content-manager.js';
        script.onload = () => console.log('✅ Content Manager loaded via script tag');
        script.onerror = (err) => console.error('❌ Script loading failed:', err);
        document.head.appendChild(script);
      }
    };

    loadComponent();
  }, []);

  // Set up props and event listeners
  useEffect(() => {
    const element = componentRef.current;
    if (!element) return;

    // Set properties
    element.apiBase = apiBase;
    element.authToken = token;
    element.userContext = currentUser;
    element.selectionMode = selectionMode;
    element.showUpload = showUpload;
    element.showGallery = showGallery;
    element.showSearch = showSearch;
    element.maxFileSize = maxFileSize;

    // Set up event listeners
    const handleContentUploaded = (event) => {
      if (onContentUploaded) {
        onContentUploaded(event.detail);
      }
    };

    const handleAuthRequired = (event) => {
      if (onAuthRequired) {
        onAuthRequired(event.detail);
      }
    };

    const handleError = (event) => {
      if (onError) {
        onError(event.detail);
      }
    };

    const handleSelectionChanged = (event) => {
      if (onSelectionChanged) {
        onSelectionChanged(event.detail);
      }
    };

    const handleSearchChanged = (event) => {
      if (onSearchChanged) {
        onSearchChanged(event.detail);
      }
    };

    const handleFilterChanged = (event) => {
      if (onFilterChanged) {
        onFilterChanged(event.detail);
      }
    };

    element.addEventListener('content-uploaded', handleContentUploaded);
    element.addEventListener('auth-required', handleAuthRequired);
    element.addEventListener('content-error', handleError);
    element.addEventListener('selection-changed', handleSelectionChanged);
    element.addEventListener('search-changed', handleSearchChanged);
    element.addEventListener('filter-changed', handleFilterChanged);

    return () => {
      element.removeEventListener('content-uploaded', handleContentUploaded);
      element.removeEventListener('auth-required', handleAuthRequired);
      element.removeEventListener('content-error', handleError);
      element.removeEventListener('selection-changed', handleSelectionChanged);
      element.removeEventListener('search-changed', handleSearchChanged);
      element.removeEventListener('filter-changed', handleFilterChanged);
    };
  }, [
    token, 
    currentUser, 
    apiBase, 
    selectionMode, 
    showUpload, 
    showGallery, 
    showSearch, 
    maxFileSize,
    onContentUploaded,
    onAuthRequired,
    onError,
    onSelectionChanged,
    onSearchChanged,
    onFilterChanged
  ]);

  return (
    <div className={`content-manager-wrapper ${className || ''}`} style={style}>
      <tamyla-content-manager
        ref={componentRef}
        {...props}
      />
    </div>
  );
}

export default ContentManager;
