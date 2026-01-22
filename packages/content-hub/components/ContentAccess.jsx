import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SearchInterface,
  SearchResultsList,
  RecentSearchesList,
  SearchStatusIndicator,
  createDefaultSearchStatuses
} from '@tamyla/ui-components-react';
import { contentService } from '../src/services/SharedContentHubService';
import { healthService } from '../dist/services/healthService';
import { AuthService } from '@tamyla/shared/auth';
import { Logger } from '@tamyla/shared/utils';

// Initialize shared services
const authService = new AuthService();
const logger = new Logger('ContentAccess');
import { validateCurrentAuthToken } from '../dist/services/jwtService';
import { contentApi } from '../api';
import MEILISEARCH_CONFIG from '../dist/config/meilisearch';
import '../styles/ContentAccess.css';

/**
 * ContentAccess - Universal Content Hub Component
 * 
 * A reusable search interface component designed for any application.
 * Clean, universal implementation with no duplication.
 */
export const ContentAccess = (props) => {
  const {
    authToken,
    currentUser,
    apiBase,
    enableDebugLogging = false,
    enableMockFallback = false,
    className = '',
    style = {},
    customFilters = [],
    domainConfig = null,
    onFileViewed,
    onFileDownloaded,
    onSearchPerformed,
    onError,
    showRecentSearches = true,
    showFilters = true,
    maxRecentSearches = 5,
    placeholder = "Search for content...",
    title = "🔍 Content Access",
    subtitle = "Search and access your content"
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [isThemeReady, setIsThemeReady] = useState(true);

  const user = useMemo(() => currentUser || {}, [currentUser]);

  const searchService = useMemo(() => {
    // Use shared content service instead of deprecated ContentSearchService
    contentService.configure({
      authToken,
      apiBase: apiBase || MEILISEARCH_CONFIG.gatewayUrl,
      debugLogging: enableDebugLogging
    });
    return contentService;
  }, [authToken, apiBase, enableDebugLogging]);

  const searchFilters = useMemo(() => {
    if (customFilters.length > 0) {
      return customFilters;
    }
    return [
      {
        label: 'Type',
        type: 'select',
        options: [
          { value: 'document', label: 'Documents' },
          { value: 'image', label: 'Images' },
          { value: 'video', label: 'Videos' },
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
    ];
  }, [customFilters]);

  const checkServiceHealth = useCallback(async () => {
    try {
      const healthStatus = await healthService.checkHealth();
      const contentHubHealth = await contentApi.checkHealth();
      const combinedStatus = {
        ...healthStatus,
        contentHub: contentHubHealth.success ? 'online' : 'offline',
        details: {
          ...healthStatus.details,
          contentHubMessage: contentHubHealth.message || 'Content Hub status unknown'
        }
      };
      setServiceStatus(combinedStatus.gateway === 'online' && combinedStatus.contentHub === 'online' ? 'online' : 'offline');
      if (enableDebugLogging) {
        logger.debug('Combined Service Health Status', combinedStatus);
      }
    } catch (error) {
      logger.warn('Failed to check service health', error);
      setServiceStatus('offline');
      if (onError) onError(error);
    }
  }, [enableDebugLogging, onError]);

  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = authService.getStorageItem('tamyla-recent-searches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, maxRecentSearches));
      }
    } catch (error) {
      logger.error('Failed to load recent searches', error);
      if (onError) onError(error);
    }
  }, [maxRecentSearches, onError]);

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
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, maxRecentSearches);
      setRecentSearches(newRecentSearches);
      authService.setStorageItem('tamyla-recent-searches', JSON.stringify(newRecentSearches));
      if (onSearchPerformed) {
        onSearchPerformed(query, response.results?.length || 0);
      }
    } catch (error) {
      logger.error('Search failed', error);
      setSearchResults([]);
      if (onError) onError(error);
    } finally {
      setIsSearching(false);
    }
  }, [searchService, user?.id, recentSearches, maxRecentSearches, onSearchPerformed, onError]);

  const handleResultClick = useCallback(async (result) => {
    try {
      const signedUrlResponse = await contentApi.generateSignedUrl(result.id, 3600);
      if (signedUrlResponse.success) {
        window.open(signedUrlResponse.signedUrl, '_blank');
        if (onFileViewed) onFileViewed(result);
      } else {
        const fallbackUrl = `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/access/${result.id}`;
        window.open(fallbackUrl, '_blank');
        if (onFileViewed) onFileViewed(result);
      }
    } catch (error) {
      logger.error('Error accessing file', error);
      const fallbackUrl = result.url || `${process.env.REACT_APP_CONTENT_SERVICE_URL || 'https://content.tamyla.com'}/access/${result.id}`;
      window.open(fallbackUrl, '_blank');
      if (onFileViewed) onFileViewed(result);
      if (onError) onError(error);
    }
  }, [onFileViewed, onError]);

  const handleDownload = useCallback(async (result) => {
    try {
      const blob = await contentApi.downloadFile(result.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = result.filename || `file-${result.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      if (onFileDownloaded) onFileDownloaded(result);
    } catch (error) {
      logger.error('Error downloading file', error);
      if (onError) onError(error);
    }
  }, [onFileDownloaded, onError]);

  const handleRecentSearchClick = useCallback((search) => {
    handleSearch(search);
  }, [handleSearch]);

  const searchStatuses = useMemo(() => createDefaultSearchStatuses(), []);

  useEffect(() => {
    loadRecentSearches();
    checkServiceHealth();
  }, [loadRecentSearches, checkServiceHealth]);

  return (
    <div className={`content-access-page ${className}`} style={style}>
      <div className="access-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="search-interface-container">
        {!isThemeReady ? (
          <div className="search-loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading search interface...</p>
          </div>
        ) : (
          <SearchInterface
            placeholder={placeholder}
            onSearch={handleSearch}
            showFilters={showFilters}
            filters={searchFilters}
          />
        )}
        {isSearching && (
          <div className="search-loading">
            <p>Searching for "{searchQuery}"...</p>
          </div>
        )}
      </div>

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

      {showRecentSearches && (
        <RecentSearchesList
          searches={recentSearches}
          onSearchClick={handleRecentSearchClick}
          maxItems={maxRecentSearches}
          title="🔄 Recent Searches"
          emptyMessage="No recent searches yet"
        />
      )}

      <SearchStatusIndicator
        statuses={searchStatuses}
        title="🔗 Content Search Integration"
      />
    </div>
  );
};

export default ContentAccess;