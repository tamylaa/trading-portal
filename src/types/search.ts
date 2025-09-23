// SearchDocument Interface - Trading Portal
// Shared interface for MeiliSearch integration consistency
// Matches content-skimmer/src/types/index.ts SearchDocument

export interface SearchDocument {
  id: string;
  title: string;
  summary: string;
  entities: string[];
  topics: string[];
  userId: string;         // Consistent camelCase naming
  filename: string;
  mimeType: string;
  uploadedAt: string;
  lastAnalyzed: string;
}

// Enhanced search interface for trading portal specific features
export interface TradingPortalSearchDocument extends SearchDocument {
  // Trading portal specific extensions
  category?: 'market-analysis' | 'trade-opportunity' | 'research' | 'regulatory' | 'general';
  priority?: 'high' | 'medium' | 'low';
  tradeableMarkets?: string[];    // e.g., ['spices', 'commodities', 'textiles']
  regionTags?: string[];          // e.g., ['MENA', 'Asia', 'Europe']
  regulatoryTags?: string[];      // e.g., ['export-requirements', 'customs', 'certifications']
}

// Search request interface for consistent API calls
export interface SearchRequest {
  q: string;
  limit?: number;
  offset?: number;
  filter?: string;
  sort?: string[];
  categories?: string[];
  markets?: string[];
  regions?: string[];
}

// Search response interface matching MeiliSearch format
export interface SearchResponse {
  hits: SearchDocument[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

// MeiliSearch service client interface for trading portal
export interface MeiliSearchService {
  search(request: SearchRequest, userId: string): Promise<SearchResponse>;
  indexDocument(document: SearchDocument, userId: string): Promise<void>;
  indexDocuments(documents: SearchDocument[], userId: string): Promise<void>;
  deleteDocument(id: string, userId: string): Promise<void>;
  deleteDocuments(ids: string[], userId: string): Promise<void>;
}