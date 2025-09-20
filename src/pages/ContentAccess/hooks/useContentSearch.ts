import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchResult, ContentSearchConfig, SearchRequest } from '../types';
import { ContentSearchService } from '../services/contentSearchService';

export const useContentSearch = (config: ContentSearchConfig) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const serviceRef = useRef<ContentSearchService>();
  const abortControllerRef = useRef<AbortController>();

  // Initialize service
  useEffect(() => {
    serviceRef.current = new ContentSearchService(config.apiBaseUrl, config.token);
  }, [config.apiBaseUrl, config.token]);

  const handleSearch = useCallback(async (
    query: string, 
    filters?: Record<string, any>,
    options?: { append?: boolean; page?: number }
  ) => {
    if (!query.trim() || !serviceRef.current) {
      setSearchResults([]);
      return null;
    }

    // Cancel previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);

    const page = options?.page ?? 0;
    if (!options?.append) {
      setSearchResults([]);
      setCurrentPage(0);
    }

    try {
      const request: SearchRequest = {
        query: query.trim(),
        userId: config.userId,
        filters,
        limit: 20,
        offset: page * 20,
      };

      const response = await serviceRef.current.search(request);

      if (options?.append) {
        setSearchResults(prev => [...prev, ...response.results]);
      } else {
        setSearchResults(response.results);
      }

      setHasMore(response.hasMore);
      setCurrentPage(page);
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null; // Search was cancelled
      }
      
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      
      if (!options?.append) {
        setSearchResults([]);
      }
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [config.userId]);

  const loadMore = useCallback(async (query: string, filters?: Record<string, any>) => {
    if (!hasMore || isSearching) return;
    
    return handleSearch(query, filters, { 
      append: true, 
      page: currentPage + 1 
    });
  }, [handleSearch, hasMore, isSearching, currentPage]);

  const handleResultClick = useCallback(async (result: SearchResult) => {
    try {
      // Track analytics
      if (serviceRef.current) {
        await serviceRef.current.trackResultClick(result.id, config.userId);
      }
      
      // Open result
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track result click:', error);
      // Still open the result even if tracking fails
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  }, [config.userId]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setHasMore(false);
    setCurrentPage(0);
    setError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    hasMore,
    currentPage,
    handleSearch,
    loadMore,
    handleResultClick,
    clearResults,
  };
};
