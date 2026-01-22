import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@tamyla/shared/auth';
import { Logger } from '@tamyla/shared/utils';

// Initialize shared services
const authService = new AuthService();
const logger = new Logger('useRecentSearches');

export const useRecentSearches = (config) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const storageKey = config.storageKey || 'content_access_recent_searches';
  const maxItems = config.maxItems || 5;

  // Load from shared AuthService on mount
  useEffect(() => {
    try {
      const stored = authService.getStorageItem(storageKey);
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, maxItems));
      }
    } catch (error) {
      logger.error('Failed to load recent searches', error);
    }
  }, [storageKey, maxItems]);

  // Save to shared AuthService whenever recentSearches changes
  useEffect(() => {
    try {
      authService.setStorageItem(storageKey, JSON.stringify(recentSearches));
    } catch (error) {
      logger.error('Failed to save recent searches', error);
    }
  }, [recentSearches, storageKey]);

  const addRecentSearch = useCallback((query) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(search => search.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const handleRecentSearchClick = useCallback(async (search) => {
    await config.onSearch(search);
    addRecentSearch(search); // Move to top
  }, [config, addRecentSearch]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      authService.removeStorageItem(storageKey);
    } catch (error) {
      logger.error('Failed to clear recent searches', error);
    }
  }, [storageKey]);

  const removeRecentSearch = useCallback((search) => {
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