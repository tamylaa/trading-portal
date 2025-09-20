import { useState, useEffect, useCallback } from 'react';
import { RecentSearchesConfig } from '../types';
import { localStorageService } from '../services/localStorageService';

export const useRecentSearches = (config: RecentSearchesConfig) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const storageKey = config.storageKey || 'content_access_recent_searches';
  const maxItems = config.maxItems || 5;

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorageService.get<string[]>(storageKey, []);
    if (stored) {
      setRecentSearches(stored.slice(0, maxItems));
    }
  }, [storageKey, maxItems]);

  // Save to localStorage whenever recentSearches changes
  useEffect(() => {
    localStorageService.set(storageKey, recentSearches);
  }, [recentSearches, storageKey]);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const handleRecentSearchClick = useCallback(async (search: string) => {
    await config.onSearch(search);
    addRecentSearch(search); // Move to top
  }, [config, addRecentSearch]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorageService.remove(storageKey);
  }, [storageKey]);

  const removeRecentSearch = useCallback((search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    handleRecentSearchClick,
    clearRecentSearches,
    removeRecentSearch,
  };
};
