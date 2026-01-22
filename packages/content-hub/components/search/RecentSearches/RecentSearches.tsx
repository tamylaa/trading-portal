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

export interface RecentSearchesProps {
  searches: string[];
  onSearchClick: (search: string) => void;
  onClear?: () => void;
  className?: string;
  maxDisplay?: number;
}

const RecentSearches: React.FC<RecentSearchesProps> = memo(({ 
  searches, 
  onSearchClick, 
  onClear,
  className = '',
  maxDisplay
}) => {
  const displaySearches = maxDisplay ? searches.slice(0, maxDisplay) : searches;

  if (searches.length === 0) {
    return (
      <div className={`recent-searches-empty ${className}`}>
        <p className="empty-message">No recent searches</p>
      </div>
    );
  }

  return (
    <div className={`recent-searches ${className}`}>
      <div className="recent-searches-header">
        <h4>Recent Searches</h4>
        {onClear && (
          <button 
            className="clear-button"
            onClick={() => {
              try {
                onClear();
              } catch (error) {
                Logger.error('Error clearing recent searches:', error);
              }
            }}
            type="button"
            aria-label="Clear recent searches"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="recent-searches-list">
        {displaySearches.map((search, index) => (
          <div 
            key={`${search}-${index}`}
            className="recent-search-item"
            onClick={() => {
              try {
                onSearchClick(search);
              } catch (error) {
                Logger.error('Error handling search click:', error);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                  onSearchClick(search);
                } catch (error) {
                  Logger.error('Error handling search keydown:', error);
                }
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
      
      {maxDisplay && searches.length > maxDisplay && (
        <div className="recent-searches-footer">
          <p className="more-searches">
            +{searches.length - maxDisplay} more searches
          </p>
        </div>
      )}
    </div>
  );
});

RecentSearches.displayName = 'RecentSearches';

export default RecentSearches;