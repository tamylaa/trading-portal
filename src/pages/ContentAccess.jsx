// Content Access Page - Search and access content with integrated search application
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  SearchInterface,
  SearchResultsList,
  RecentSearchesList,
  SearchStatusIndicator,
  createDefaultSearchStatuses
} from '@tamyla/ui-components-react';
// import '@tamyla/ui-components-react/dist/styles.css'; // TODO: Fix CSS import path
import PageLayout from '../components/common/PageLayout';
import './ContentAccess/ContentAccess.css';const ContentAccess = () => {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  // Temporary fix for theme hydration timing issue
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    loadRecentSearches();
    
    // TEMPORARY FIX: Wait for theme hydration
    // This demonstrates the issue - the package should handle this internally
    const themeTimer = setTimeout(() => {
      setIsThemeReady(true);
    }, 100); // Small delay to ensure theme CSS is applied
    
    return () => clearTimeout(themeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct for one-time initialization

  const loadRecentSearches = async () => {
    try {
      const response = await fetch('/api/content/recent-searches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const searches = await response.json();
        setRecentSearches(searches.slice(0, 5)); // Show last 5 searches
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
      const response = await fetch('/api/content/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query.trim(), userId: user?.id })
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        // Save to recent searches
        setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token, user?.id]); // 🎯 Stable dependencies

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
    <PageLayout title="Content Access" subtitle="Search and access your content with our integrated search application">
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
    </PageLayout>
  );
};

export default ContentAccess;
