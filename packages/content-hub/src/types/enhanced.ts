/**
 * Enhanced Content Hub Types
 * 
 * Incorporating excellent type patterns from ContentAccess
 * while avoiding duplication with existing Content Hub types.
 */

// Enhanced SearchResult with smart legacy compatibility
export interface SearchResult {
  // Core MeiliSearch fields
  id: string;
  title: string;
  summary: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  
  // Search enhancements
  score?: number;
  _formatted?: {
    title: string;
    summary: string;
  };
  
  // Legacy compatibility (auto-mapped for backward compatibility)
  name?: string;        // → title
  description?: string; // → summary  
  type?: string;        // → derived from mimeType
  url?: string;         // → constructed from id
  date?: string;        // → uploadedAt
  size?: number;        // → optional enhancement
  thumbnail?: string;   // → auto-generated preview
  tags?: string[];      // → optional enhancement
}

// Enhanced Service Health with comprehensive monitoring
export interface ServiceHealth {
  gateway: 'online' | 'offline' | 'unknown';
  meilisearch: 'online' | 'offline' | 'unknown';
  timestamp: string;
  error?: string;
  latency?: number;
  fallbackActive?: boolean;
  lastSuccessful?: string;
}

// Recent search tracking
export interface RecentSearch {
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters?: Record<string, any>;
}

// Enhanced search request with pagination and sorting
export interface SearchRequest {
  query: string;
  userId?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: string[];
  facets?: string[];
}

// Comprehensive search response
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  hasMore: boolean;
  facets?: Record<string, any>;
  processingTimeMs?: number;
  page?: number;
  error?: string;
}

// Configuration types for enhanced flexibility
export interface ContentSearchConfig {
  token?: string;
  userId?: string;
  apiBaseUrl?: string;
  timeout?: number;
  retries?: number;
  enableFallback?: boolean;
  enableCaching?: boolean;
  debugMode?: boolean;
}

// Component prop types for enhanced components
export interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  query: string;
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchClick: (query: string) => void;
  maxItems?: number;
  showClear?: boolean;
  onClear?: () => void;
}

// Enhanced capability configuration
export interface CapabilityConfig {
  search?: {
    enabled: boolean;
    placeholder?: string;
    showFilters?: boolean;
    showRecent?: boolean;
    maxResults?: number;
  };
  upload?: {
    enabled: boolean;
    maxFileSize?: number;
    allowedTypes?: string[];
    enableDragDrop?: boolean;
  };
  gallery?: {
    enabled: boolean;
    viewModes?: ('grid' | 'list')[];
    thumbnailSize?: 'small' | 'medium' | 'large';
  };
  sharing?: {
    enabled: boolean;
    permissions?: string[];
    expirationOptions?: string[];
  };
}

// Types are already exported above via individual export statements