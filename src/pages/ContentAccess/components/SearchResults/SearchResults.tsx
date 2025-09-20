import React, { memo } from 'react';
import { SearchResultsProps } from '../../types';

const SearchResults: React.FC<SearchResultsProps> = memo(({ 
  results, 
  onResultClick, 
  query, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results-empty">
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try adjusting your search query or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h3>Search Results ({results.length})</h3>
        <span className="search-query">for "{query}"</span>
      </div>
      
      <div className="results-grid">
        {results.map((result) => (
          <div 
            key={result.id} 
            className="result-card"
            onClick={() => onResultClick(result)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onResultClick(result);
              }
            }}
          >
            {result.thumbnail && (
              <div className="result-thumbnail">
                <img src={result.thumbnail} alt={result.name} />
              </div>
            )}
            
            <div className="result-content">
              <h4 className="result-title">{result.name}</h4>
              
              <div className="result-meta">
                <span className="result-type">{result.type}</span>
                <span className="result-date">{new Date(result.date).toLocaleDateString()}</span>
                <span className="result-size">{formatFileSize(result.size)}</span>
              </div>
              
              {result.description && (
                <p className="result-description">{result.description}</p>
              )}
              
              {result.tags.length > 0 && (
                <div className="result-tags">
                  {result.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="result-score">
                <span>Match: {Math.round(result.score * 100)}%</span>
              </div>
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
