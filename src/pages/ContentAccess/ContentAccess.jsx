// Content Access Page - Search and access content with integrated search application
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SearchInterface,
  SearchResultsList,
  RecentSearchesList,
  SearchStatusIndicator,
  createDefaultSearchStatuses 
} from '@tamyla/ui-components-react';
import { ContentSearchService } from './services/contentSearchService';
import { healthService } from './services/healthService';
import { validateCurrentAuthToken } from './services/jwtService';
import MEILISEARCH_CONFIG from './config/meilisearch';
import './ContentAccess.css';

const ContentAccess = () => {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('unknown');
  const [authStatus, setAuthStatus] = useState({ isValid: false, needsLogin: false });
  // Temporary fix for theme hydration timing issue
  const [isThemeReady, setIsThemeReady] = useState(false);

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
      setServiceStatus(healthStatus.gateway === 'online' ? 'online' : 'offline');
      
      // Log the health status for debugging
      console.log('Service Health Status:', healthStatus);
      
      if (healthStatus.meilisearch === 'offline') {
        console.warn('MeiliSearch service is currently unavailable. Using fallback data.');
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
  const handleResultClick = useCallback((result) => {
    // Handle clicking on a search result
    window.open(result.url, '_blank');
  }, []); // 🎯 No dependencies - stable function

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

      {/* Search Results - Using Package Component */}
      <SearchResultsList
        results={searchResults}
        onResultClick={handleResultClick}
        loading={isSearching}
        emptyMessage="No content found. Try adjusting your search terms."
      />

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
