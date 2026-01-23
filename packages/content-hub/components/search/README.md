# Search Components

A comprehensive search UI toolkit providing reusable components for search functionality across the @tamyla ecosystem.

## Components

### SearchResults
Displays search results with rich metadata, thumbnails, and interactive features.

**Features:**
- Result cards with thumbnails and metadata
- File size formatting
- Score-based relevance indicators
- Keyboard navigation
- Loading and empty states
- Accessibility support

### RecentSearches
Shows recent search history with quick access functionality.

**Features:**
- Recent search history display
- One-click search replay
- Clear all functionality
- Configurable display limits
- Keyboard navigation

### SearchStatus
System status indicator for search-related services.

**Features:**
- Multi-service status monitoring
- Customizable service definitions
- Visual status indicators
- Offline mode handling
- Real-time status updates

## Usage

```tsx
import { 
  SearchResults, 
  RecentSearches, 
  SearchStatus 
} from '@tamyla/content-hub';

// Search Results
<SearchResults
  results={searchResults}
  onResultClick={handleResultClick}
  query="user query"
  loading={isSearching}
/>

// Recent Searches
<RecentSearches
  searches={recentSearches}
  onSearchClick={handleSearchClick}
  onClear={clearRecentSearches}
  maxDisplay={5}
/>

// Search Status
<SearchStatus
  isConnected={true}
  searchService="connected"
  database="ready"
  analytics="active"
/>
```

## Types

All components are fully typed with TypeScript interfaces exported for use in consuming applications.

## Accessibility

All search components follow WAI-ARIA best practices:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management