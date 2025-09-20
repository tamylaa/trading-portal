// Domain Types
export interface SearchResult {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  date: string;
  size: number;
  thumbnail?: string;
  description?: string;
  tags: string[];
  score: number;
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
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  hasMore: boolean;
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
