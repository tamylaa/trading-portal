import { SearchRequest, SearchResponse } from '../types';

export class ContentSearchService {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = '/api/content', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getRecentSearches(userId?: string): Promise<string[]> {
    const endpoint = userId ? `/recent-searches?userId=${userId}` : '/recent-searches';
    return this.request<string[]>(endpoint);
  }

  async saveRecentSearch(query: string, userId?: string): Promise<void> {
    return this.request<void>('/recent-searches', {
      method: 'POST',
      body: JSON.stringify({ query, userId }),
    });
  }

  async trackResultClick(resultId: string, userId?: string): Promise<void> {
    return this.request<void>('/analytics/result-click', {
      method: 'POST',
      body: JSON.stringify({ resultId, userId, timestamp: new Date().toISOString() }),
    });
  }

  async getSearchStatus(): Promise<{
    searchService: 'connected' | 'disconnected';
    database: 'ready' | 'error';
    analytics: 'active' | 'inactive';
  }> {
    return this.request<any>('/status');
  }
}

// Export a default instance
export const contentSearchService = new ContentSearchService();
