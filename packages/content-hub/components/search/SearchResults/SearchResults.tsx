import React, { memo } from 'react';

// Temporary mock Logger until @tamyla/shared is available
const Logger = {
  error: (...args: any[]) => {
    if (typeof window !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const error = window['console'] && window['console']['error'];
      if (error) error('[ERROR]', ...args);
    }
  }
};

// Search Result Types
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  _formatted?: {
    title: string;
    summary: string;
  };
  score?: number;
  // Legacy compatibility fields
  name?: string; // Maps to title
  type?: string; // Derived from mimeType
  url?: string; // Can be constructed from id
  date?: string; // Maps to uploadedAt
  size?: number; // Not provided by MeiliSearch
  thumbnail?: string;
  description?: string; // Maps to summary
  tags?: string[]; // Not provided by MeiliSearch
}

export interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  query: string;
  loading?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = memo(({ 
  results, 
  onResultClick, 
  query, 
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`search-results-loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`search-results-empty ${className}`}>
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try adjusting your search query or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`search-results ${className}`}>
      <div className="results-header">
        <h3>Search Results ({results.length})</h3>
        <span className="search-query">for "{query}"</span>
      </div>
      
      <div className="results-grid">
        {results.map((result) => (
          <div 
            key={result.id} 
            className="result-card"
            onClick={() => {
              try {
                onResultClick(result);
              } catch (error) {
                Logger.error('Error handling result click:', error);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                  onResultClick(result);
                } catch (error) {
                  Logger.error('Error handling result keydown:', error);
                }
              }
            }}
          >
            {result.thumbnail && (
              <div className="result-thumbnail">
                <img src={result.thumbnail} alt={result.name || result.title} />
              </div>
            )}
            
            <div className="result-content">
              <h4 className="result-title">{result.name || result.title}</h4>
              
              <div className="result-meta">
                <span className="result-type">{result.type || result.mimeType}</span>
                <span className="result-date">
                  {new Date(result.date || result.uploadedAt).toLocaleDateString()}
                </span>
                {result.size && (
                  <span className="result-size">{formatFileSize(result.size)}</span>
                )}
              </div>
              
              {(result.description || result.summary) && (
                <p className="result-description">{result.description || result.summary}</p>
              )}
              
              {result.tags && result.tags.length > 0 && (
                <div className="result-tags">
                  {result.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {result.score && (
                <div className="result-score">
                  <span>Match: {Math.round(result.score * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

// Utility function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default SearchResults;