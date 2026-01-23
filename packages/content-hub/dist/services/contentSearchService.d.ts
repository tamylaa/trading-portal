import { SearchRequest, SearchResponse } from '../types';
export declare class ContentSearchService {
    private baseUrl;
    private token?;
    private fallbackMode;
    private config;
    constructor(baseUrl?: string, token?: string);
    private request;
    search(request: SearchRequest): Promise<SearchResponse>;
    private getMockSearchResponse;
    getRecentSearches(userId?: string): Promise<string[]>;
    saveRecentSearch(query: string, userId?: string): Promise<void>;
    trackResultClick(resultId: string, userId?: string): Promise<void>;
    getSearchStatus(): Promise<{
        searchService: 'connected' | 'disconnected';
        database: 'ready' | 'error';
        analytics: 'active' | 'inactive';
    }>;
}
export declare const contentSearchService: ContentSearchService;
//# sourceMappingURL=contentSearchService.d.ts.map