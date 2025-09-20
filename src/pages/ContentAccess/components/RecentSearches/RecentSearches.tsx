import React, { memo } from 'react';
import { RecentSearchesProps } from '../../types';

const RecentSearches: React.FC<RecentSearchesProps> = memo(({ 
  searches, 
  onSearchClick, 
  onClear 
}) => {
  if (searches.length === 0) {
    return (
      <div className="recent-searches-empty">
        <p className="empty-message">No recent searches</p>
      </div>
    );
  }

  return (
    <div className="recent-searches">
      <div className="recent-searches-header">
        <h4>Recent Searches</h4>
        {onClear && (
          <button 
            className="clear-button"
            onClick={onClear}
            type="button"
            aria-label="Clear recent searches"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="recent-searches-list">
        {searches.map((search, index) => (
          <div 
            key={`${search}-${index}`}
            className="recent-search-item"
            onClick={() => onSearchClick(search)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSearchClick(search);
              }
            }}
          >
            <span className="search-text">{search}</span>
            <svg 
              className="search-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
});

RecentSearches.displayName = 'RecentSearches';

export default RecentSearches;
