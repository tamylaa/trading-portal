// Domain Types
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

export interface RecentSearch {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface SearchFilters {
  label: string;
  type: 'select' | 'range' | 'checkbox' | 'date';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  value?: any;
}

// API Types
export interface SearchRequest {
  query: string;
  userId?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  hasMore: boolean;
  facets?: Record<string, any>;
  processingTimeMs?: number;
  // Legacy compatibility
  page?: number;
}

// MeiliSearch Gateway Types
export interface MeiliSearchResult {
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
}

export interface MeiliSearchResponse {
  hits: MeiliSearchResult[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  facetDistribution?: Record<string, any>;
}

// Service Health Types
export interface ServiceHealth {
  gateway: 'online' | 'offline' | 'unknown';
  meilisearch: 'online' | 'offline' | 'unknown';
  timestamp?: string;
  error?: string;
}

// Hook Configuration Types
export interface ContentSearchConfig {
  token?: string;
  userId?: string;
  apiBaseUrl?: string;
}

export interface RecentSearchesConfig {
  maxItems?: number;
  storageKey?: string;
  onSearch: (query: string) => Promise<any>;
}

export interface SearchStatus {
  type: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  message: string;
}

export interface SearchStatusConfig {
  idleMessage?: string;
  autoResetDelay?: number;
}

// Component Props Types
export interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  query: string;
  loading?: boolean;
}

export interface RecentSearchesProps {
  searches: string[];
  onSearchClick: (search: string) => void;
  onClear?: () => void;
}

export interface SearchStatusProps {
  isConnected?: boolean;
  searchService?: 'connected' | 'disconnected' | 'loading';
  database?: 'ready' | 'error' | 'loading';
  analytics?: 'active' | 'inactive';
}
