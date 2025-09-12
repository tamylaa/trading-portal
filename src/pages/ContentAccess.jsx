// Content Access Page - Search and access content with integrated search application
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SearchInterface } from '@tamyla/ui-components-react';
import './ContentAccess.css';

const ContentAccess = () => {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    loadRecentSearches();
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

  const handleSearch = async (query) => {
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
  };

  const handleResultClick = (result) => {
    // Handle clicking on a search result
    window.open(result.url, '_blank');
  };

  return (
    <div className="content-access-page">
      <div className="access-header">
        <h1>🔍 Content Access</h1>
        <p>Search and access your content with our integrated search application</p>
      </div>

      {/* Search Interface */}
      <div className="search-interface-container">
        <SearchInterface
          placeholder="Search for content..."
          onSearch={handleSearch}
          showFilters={true}
          filters={[
            { label: 'Type', type: 'select', options: [
              { value: 'image', label: 'Images' },
              { value: 'video', label: 'Videos' },
              { value: 'document', label: 'Documents' },
              { value: 'audio', label: 'Audio' }
            ]},
            { label: 'Date Range', type: 'select', options: [
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'all', label: 'All Time' }
            ]}
          ]}
        />
        {isSearching && (
          <div className="search-loading">
            <p>Searching for "{searchQuery}"...</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results ({searchResults.length} found)</h3>
          </div>
          
          <div className="results-list">
            {searchResults.map((result, index) => (
              <div key={index} className="result-item" onClick={() => handleResultClick(result)}>
                <div className="result-info">
                  <span className="result-name">{result.name}</span>
                  <span className="result-type">{result.type}</span>
                  <span className="result-date">
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="result-actions">
                  <button onClick={(e) => { e.stopPropagation(); handleResultClick(result); }}>
                    🔗 Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>🔄 Recent Searches</h3>
          <div className="searches-list">
            {recentSearches.map((search, index) => (
              <div key={index} className="search-item" onClick={() => handleSearch(search)}>
                <span className="search-query">{search}</span>
                <button onClick={(e) => { e.stopPropagation(); handleSearch(search); }}>
                  🔍 Search Again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Status */}
      <div className="search-status">
        <h4>🔗 Content Search Integration</h4>
        <div className="status-indicators">
          <div className="status-item">
            <span className="status-dot active"></span>
            Search Service: Connected
          </div>
          <div className="status-item">
            <span className="status-dot active"></span>
            Content Database: Ready
          </div>
          <div className="status-item">
            <span className="status-dot active"></span>
            Search Application: Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAccess;
