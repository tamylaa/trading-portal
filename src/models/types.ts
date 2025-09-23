export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Re-export search types for consistent import paths
export type {
  SearchDocument,
  TradingPortalSearchDocument,
  SearchRequest,
  SearchResponse,
  MeiliSearchService
} from '../types/search';