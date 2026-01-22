import MEILISEARCH_CONFIG from '../config/meilisearch';
export class ContentSearchService {
    constructor(baseUrl, token) {
        this.fallbackMode = false;
        this.config = MEILISEARCH_CONFIG;
        this.baseUrl = baseUrl || this.config.gatewayUrl;
        this.token = token;
        // Log configuration in development
        if (this.config.IS_DEVELOPMENT && this.config.enableDebugLogging) {
            console.log('ContentSearchService initialized:', {
                baseUrl: this.baseUrl,
                environment: this.config.ENVIRONMENT,
                enableMockFallback: this.config.enableMockFallback
            });
        }
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers,
        };
        // Add timeout based on environment
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            // Log errors in development
            if (this.config.enableDebugLogging) {
                console.error('Request failed:', error);
            }
            throw error;
        }
    }
    async search(request) {
        try {
            const meilisearchResponse = await this.request('/search', {
                method: 'POST',
                body: JSON.stringify({
                    q: request.query,
                    limit: request.limit || 20,
                    offset: request.offset || 0,
                    filter: request.filters ? Object.entries(request.filters).map(([key, value]) => `${key} = "${value}"`).join(' AND ') : undefined,
                    sort: request.sort,
                }),
            });
            // Convert MeiliSearch response to expected SearchResponse format
            return {
                results: meilisearchResponse.hits || [],
                total: meilisearchResponse.estimatedTotalHits || meilisearchResponse.hits?.length || 0,
                query: request.query,
                hasMore: (meilisearchResponse.offset || 0) + (meilisearchResponse.hits?.length || 0) < (meilisearchResponse.estimatedTotalHits || 0),
                processingTimeMs: meilisearchResponse.processingTimeMs
            };
        }
        catch (error) {
            // Fallback to mock data if gateway/MeiliSearch is unavailable
            console.warn('Search service unavailable, using mock data:', error);
            return this.getMockSearchResponse(request.query);
        }
    }
    getMockSearchResponse(query) {
        if (!this.config.enableMockFallback) {
            // In production, don't return mock data
            return {
                results: [],
                total: 0,
                query,
                hasMore: false,
                processingTimeMs: 0
            };
        }
        const mockResultsCount = this.config.FALLBACK.MOCK_RESULTS_COUNT;
        const mockResults = Array.from({ length: mockResultsCount }, (_, index) => ({
            id: `mock-${index + 1}`,
            title: `${this.config.TRADING_FILTERS.DOCUMENT_TYPES[index % this.config.TRADING_FILTERS.DOCUMENT_TYPES.length]} - ${query}`,
            summary: `This is a sample document related to ${query}. ${this.config.FALLBACK.FALLBACK_MESSAGE}`,
            filename: `sample-${query.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.pdf`,
            mimeType: 'application/pdf',
            uploadedAt: new Date(Date.now() - (index * 86400000)).toISOString(),
            _formatted: {
                title: `Sample <mark>${query}</mark> Document ${index + 1}`,
                summary: `This is a sample document related to <mark>${query}</mark>.`
            }
        }));
        // Add delay in development to simulate network latency
        if (this.config.IS_DEVELOPMENT && this.config.FALLBACK.MOCK_DELAY_MS > 0) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        results: mockResults,
                        total: mockResults.length,
                        query,
                        hasMore: false,
                        processingTimeMs: this.config.FALLBACK.MOCK_DELAY_MS,
                        page: 1
                    });
                }, this.config.FALLBACK.MOCK_DELAY_MS);
            });
        }
        return {
            results: mockResults,
            total: mockResults.length,
            query,
            hasMore: false,
            processingTimeMs: 1,
            page: 1
        };
    }
    async getRecentSearches(userId) {
        const endpoint = userId ? `/recent-searches?userId=${userId}` : '/recent-searches';
        return this.request(endpoint);
    }
    async saveRecentSearch(query, userId) {
        return this.request('/recent-searches', {
            method: 'POST',
            body: JSON.stringify({ query, userId }),
        });
    }
    async trackResultClick(resultId, userId) {
        return this.request('/analytics/result-click', {
            method: 'POST',
            body: JSON.stringify({ resultId, userId, timestamp: new Date().toISOString() }),
        });
    }
    async getSearchStatus() {
        return this.request('/status');
    }
}
// Export a default instance
export const contentSearchService = new ContentSearchService();
