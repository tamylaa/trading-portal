// Content Access Page - Now using the unified Content Hub package
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ContentAccess as ContentHubAccess, DOMAIN_CONFIGS } from '@tamyla/content-hub';

const ContentAccess = () => {
  const { user, token } = useAuth();

  // Trading-specific configuration using Content Hub's domain configs
  const tradingFilters = [
    // Add any additional trading-specific filters beyond the domain config
  ];

  return (
    <div className="content-access-page">
      <div className="access-header">
        <h1>🔍 Content Access</h1>
        <p>Search and access your content with our integrated search application</p>
      </div>

      {/* Use the unified Content Hub component with trading configuration */}
      <ContentHubAccess
        authToken={token}
        currentUser={user}
        domainConfig="TRADING"  // Use trading domain configuration
        customFilters={tradingFilters}
        enableDebugLogging={process.env.NODE_ENV === 'development'}
        placeholder="Search for trading documents, contracts, certificates..."
        showRecentSearches={true}
        showFilters={true}
        maxRecentSearches={5}
        onFileViewed={(result) => {
          console.log('File viewed:', result.filename);
        }}
        onFileDownloaded={(result) => {
          console.log('File downloaded:', result.filename);
        }}
        onSearchPerformed={(query, results) => {
          console.log('Search performed:', query, results.length, 'results');
        }}
        onError={(error) => {
          console.error('Content Access error:', error);
        }}
      />
    </div>
  );
};

export default ContentAccess;

  // Initialize the search service with the user's token
  const searchService = useMemo(() => {
    return new ContentSearchService(undefined, token); // Use config default URL
  }, [token]);

  // Log configuration in development
  useEffect(() => {
    if (MEILISEARCH_CONFIG.enableDebugLogging) {
      console.log('ContentAccess configuration:', {
        environment: MEILISEARCH_CONFIG.ENVIRONMENT,
        gatewayUrl: MEILISEARCH_CONFIG.gatewayUrl,
        enableMockFallback: MEILISEARCH_CONFIG.enableMockFallback,
        enableHealthChecks: MEILISEARCH_CONFIG.enableHealthChecks
      });
    }
  }, []);

  // Validate JWT token whenever it changes
  useEffect(() => {
    const validation = validateCurrentAuthToken(token);
    setAuthStatus(validation);
    
    if (MEILISEARCH_CONFIG.enableDebugLogging) {
      console.log('JWT validation result:', validation);
    }
    
    if (validation.needsLogin) {
      console.warn('JWT token is invalid or expired. User may need to re-authenticate.');
    }
  }, [token]);

  useEffect(() => {
    loadRecentSearches();
    checkServiceHealth();
    
    // TEMPORARY FIX: Wait for theme hydration
    // This demonstrates the issue - the package should handle this internally
    const themeTimer = setTimeout(() => {
      setIsThemeReady(true);
    }, 100); // Small delay to ensure theme CSS is applied
    
    return () => clearTimeout(themeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct for one-time initialization

  const checkServiceHealth = async () => {
    try {
      const healthStatus = await healthService.checkHealth();
      
      // Also check Content Hub health
      const contentHubHealth = await contentApi.checkHealth();
      
      // Combine health statuses
      const combinedStatus = {
        ...healthStatus,
        contentHub: contentHubHealth.success ? 'online' : 'offline',
        details: {
          ...healthStatus.details,
          contentHubMessage: contentHubHealth.message || 'Content Hub status unknown'
        }
      };
      
      setServiceStatus(combinedStatus.gateway === 'online' && combinedStatus.contentHub === 'online' ? 'online' : 'offline');
      
      // Log the health status for debugging
      console.log('Combined Service Health Status:', combinedStatus);
      
      if (combinedStatus.meilisearch === 'offline') {
        console.warn('MeiliSearch service is currently unavailable. Using fallback data.');
      }
      
      if (combinedStatus.contentHub === 'offline') {
        console.warn('Content Hub service is currently unavailable. File operations may be limited.');
      }
    } catch (error) {
      console.warn('Failed to check service health:', error);
      setServiceStatus('offline');
    }
  };

  const loadRecentSearches = async () => {
    try {
      // Use localStorage for recent searches since the gateway doesn't handle this yet
      const stored = localStorage.getItem('tamyla-recent-searches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // 🔧 FIX: Memoize handleSearch to prevent unnecessary re-renders
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setIsSearching(true);
    
    try {
      const response = await searchService.search({
        query: query.trim(),
        userId: user?.id,
        limit: 20
      });
      
      setSearchResults(response.results || []);
      
      // Save to recent searches in localStorage
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('tamyla-recent-searches', JSON.stringify(newRecentSearches));
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchService, user?.id, recentSearches]); // 🎯 Updated dependencies

  // 🔧 FIX: Memoize handleResultClick to prevent unnecessary re-renders
  const handleResultClick = useCallback(async (result) => {
    try {
      // Use Content Hub API to generate signed URL for file access
      const signedUrlResponse = await contentApi.generateSignedUrl(result.id, 3600); // 1 hour expiry
      
      if (signedUrlResponse.success) {
        window.open(signedUrlResponse.signedUrl, '_blank');
      } else {
        console.error('Failed to generate signed URL:', signedUrlResponse.message);
        // Fallback: try to construct URL from file ID
        const fallbackUrl = `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/access/${result.id}`;
        window.open(fallbackUrl, '_blank');
      }
    } catch (error) {
      console.error('Error accessing file:', error);
      // Fallback: try to construct URL from file ID or use result.url if available
      const fallbackUrl = result.url || `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/access/${result.id}`;
      window.open(fallbackUrl, '_blank');
    }
  }, []); // 🎯 No dependencies - stable function

  // Add download functionality using Content Hub API
  const handleDownload = useCallback(async (result) => {
    try {
      const fileBlob = await contentApi.downloadFile(result.id);
      
      // Create download link
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename || `file-${result.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: try opening in new tab
      handleResultClick(result);
    }
  }, [handleResultClick]); // 🎯 Depends on handleResultClick

  // 🔧 FIX: Memoize filters array to prevent SearchInterface re-renders
  const searchFilters = useMemo(() => [
    { 
      label: 'Type', 
      type: 'select', 
      options: [
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Videos' },
        { value: 'document', label: 'Documents' },
        { value: 'audio', label: 'Audio' }
      ]
    },
    { 
      label: 'Date Range', 
      type: 'select', 
      options: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'all', label: 'All Time' }
      ]
    }
  ], []); // 🎯 Static filters - no dependencies needed

  // 🔧 FIX: Memoize recent search handlers to prevent re-renders
  const handleRecentSearchClick = useCallback((search) => {
    handleSearch(search);
  }, [handleSearch]); // 🎯 Depends on memoized handleSearch

  // Create search status using package helper
  const searchStatuses = useMemo(() => createDefaultSearchStatuses(), []);

  return (
    <div className="content-access-page">
      <div className="access-header">
        <h1>🔍 Content Access</h1>
        <p>Search and access your content with our integrated search application</p>
      </div>

      {/* Search Interface */}
      <div className="search-interface-container">
        {!isThemeReady ? (
          <div className="search-loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading search interface...</p>
          </div>
        ) : (
          <SearchInterface
            placeholder="Search for content..."
            onSearch={handleSearch}
            showFilters={true}
            filters={searchFilters}
          />
        )}
        {isSearching && (
          <div className="search-loading">
            <p>Searching for "{searchQuery}"...</p>
          </div>
        )}
      </div>

      {/* Search Results - Enhanced with Content Hub integration */}
      <div className="search-results-section">
        <h3>Search Results</h3>
        {searchResults.length > 0 ? (
          <div className="search-results-list">
            {searchResults.map((result, index) => (
              <div key={result.id || index} className="search-result-item">
                <div className="result-content">
                  <h4 
                    className="result-title" 
                    onClick={() => handleResultClick(result)}
                    style={{ cursor: 'pointer', color: '#007bff' }}
                  >
                    {result._formatted?.title ? (
                      <span dangerouslySetInnerHTML={{ __html: result._formatted.title }} />
                    ) : (
                      result.title || result.name || 'Untitled'
                    )}
                  </h4>
                  <p className="result-summary">
                    {result._formatted?.summary ? (
                      <span dangerouslySetInnerHTML={{ __html: result._formatted.summary }} />
                    ) : (
                      result.summary || result.description || 'No description available'
                    )}
                  </p>
                  <div className="result-meta">
                    <span className="result-filename">{result.filename}</span>
                    <span className="result-date">
                      {result.uploadedAt ? new Date(result.uploadedAt).toLocaleDateString() : 
                       result.date ? new Date(result.date).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                </div>
                <div className="result-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleResultClick(result)}
                    title="View file"
                  >
                    👁️ View
                  </button>
                  <button 
                    className="action-btn download-btn"
                    onClick={() => handleDownload(result)}
                    title="Download file"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !isSearching ? (
          <p className="no-results">No content found. Try adjusting your search terms.</p>
        ) : null}
      </div>

      {/* Recent Searches - Using Package Component */}
      <RecentSearchesList
        searches={recentSearches}
        onSearchClick={handleRecentSearchClick}
        maxItems={5}
        title="🔄 Recent Searches"
        emptyMessage="No recent searches yet"
      />

      {/* Search Status - Using Package Component */}
      <SearchStatusIndicator
        statuses={searchStatuses}
        title="🔗 Content Search Integration"
      />
    </div>
  );
};

export default ContentAccess;
