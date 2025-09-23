// MeiliSearch Service Client - Trading Portal
// Consistent interface for MeiliSearch Gateway integration

import { 
  SearchDocument, 
  SearchRequest, 
  SearchResponse, 
  MeiliSearchService 
} from '../types/search';

export class TradingPortalMeiliSearchClient implements MeiliSearchService {
  private gatewayUrl: string;
  private authToken: string;

  constructor(gatewayUrl: string, authToken: string) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authToken = authToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.gatewayUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`MeiliSearch request failed: ${response.status} - ${errorData.error || response.statusText}`);
    }

    return response;
  }

  async search(request: SearchRequest, userId: string): Promise<SearchResponse> {
    const response = await this.makeRequest('/search', {
      method: 'POST',
      body: JSON.stringify({
        q: request.q,
        limit: request.limit || 20,
        offset: request.offset || 0,
        filter: request.filter,
        sort: request.sort,
      }),
    });

    return response.json();
  }

  async indexDocument(document: SearchDocument, userId: string): Promise<void> {
    // Ensure consistent userId field (the gateway will override this for security)
    const documentWithUserId = {
      ...document,
      userId: userId, // Consistent camelCase field name
    };

    await this.makeRequest('/documents', {
      method: 'POST',
      body: JSON.stringify([documentWithUserId]),
    });
  }

  async indexDocuments(documents: SearchDocument[], userId: string): Promise<void> {
    // Ensure consistent userId field for all documents
    const documentsWithUserId = documents.map(doc => ({
      ...doc,
      userId: userId, // Consistent camelCase field name
    }));

    await this.makeRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(documentsWithUserId),
    });
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    await this.deleteDocuments([id], userId);
  }

  async deleteDocuments(ids: string[], userId: string): Promise<void> {
    await this.makeRequest('/documents', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  // Trading Portal specific search methods
  async searchByCategory(query: string, category: string, userId: string): Promise<SearchResponse> {
    return this.search({
      q: query,
      filter: `category = "${category}"`,
    }, userId);
  }

  async searchByMarket(query: string, market: string, userId: string): Promise<SearchResponse> {
    return this.search({
      q: query,
      filter: `tradeableMarkets = "${market}"`,
    }, userId);
  }

  async searchByRegion(query: string, region: string, userId: string): Promise<SearchResponse> {
    return this.search({
      q: query,
      filter: `regionTags = "${region}"`,
    }, userId);
  }

  // Health check
  async healthCheck(): Promise<{ gateway: string; meilisearch: any; timestamp: string }> {
    const response = await fetch(`${this.gatewayUrl}/health`);
    return response.json();
  }
}

// Factory function for creating the client
export function createMeiliSearchClient(gatewayUrl: string, authToken: string): MeiliSearchService {
  return new TradingPortalMeiliSearchClient(gatewayUrl, authToken);
}

// Default configuration
export const DEFAULT_MEILISEARCH_CONFIG = {
  gatewayUrl: process.env.MEILISEARCH_GATEWAY_URL || 'https://search.tamyla.com',
  timeout: 5000,
  retries: 3,
};