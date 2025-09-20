// Main ContentAccess component - importing from .jsx file
export { default } from './ContentAccess.jsx';

// Export all types for external usage
export * from './types/index';

// Export services for external usage
export { ContentSearchService, contentSearchService } from './services/contentSearchService';
export { LocalStorageService, localStorageService } from './services/localStorageService';

// Export hooks for external usage
export * from './hooks/index';

// Export components explicitly to avoid conflicts
export { SearchResults, RecentSearches } from './components/index';
export { default as SearchStatusComponent } from './components/SearchStatus';
