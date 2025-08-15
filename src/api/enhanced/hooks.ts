// Enhanced React hooks for API integration
// TypeScript-first hooks that integrate with enhanced state management
// Progressive enhancement - provides modern patterns with fallbacks

import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedTradingApi, Trade, Portfolio, MarketData, TradingPreferences } from './trading';
import { FEATURE_FLAGS } from '../../config/features';

// Generic API hook types
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  optimisticUpdates?: boolean;
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<{ data: T; timestamp: string }>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
): ApiState<T> & {
  refetch: () => Promise<void>;
  clearError: () => void;
} {
  const {
    immediate = true,
    refreshInterval,
    retryOnError = false,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(async () => {
    if (!FEATURE_FLAGS.useEnhancedServices && !immediate) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
        lastUpdated: response.timestamp,
      });
      retryCountRef.current = 0;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff
        setTimeout(fetchData, delay);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall, retryOnError, immediate, ...dependencies]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    ...state,
    refetch: fetchData,
    clearError,
  };
}

// Trading-specific hooks
export function useTrades(filters?: {
  symbol?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getTrades(filters);
    return { data: response.data, timestamp: response.timestamp };
  }, [filters]);

  return useApi<Trade[]>(apiCall, [filters], { 
    immediate: true, 
    refreshInterval: 30000, // Refresh every 30 seconds
    retryOnError: true 
  });
}

export function usePortfolio() {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getPortfolio();
    return { data: response.data, timestamp: response.timestamp };
  }, []);

  return useApi<Portfolio>(apiCall, [], { 
    immediate: true, 
    refreshInterval: 10000, // Refresh every 10 seconds
    retryOnError: true 
  });
}

export function useMarketData(symbols: string[]) {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getMarketData(symbols);
    return { data: response.data, timestamp: response.timestamp };
  }, [symbols]);

  return useApi<MarketData[]>(apiCall, [symbols], { 
    immediate: symbols.length > 0, 
    refreshInterval: 5000, // Refresh every 5 seconds
    retryOnError: true 
  });
}

export function useTradingPreferences() {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getTradingPreferences();
    return { data: response.data, timestamp: response.timestamp };
  }, []);

  const hook = useApi<TradingPreferences>(apiCall, [], { 
    immediate: true,
    retryOnError: true 
  });

  const updatePreferences = useCallback(async (updates: Partial<TradingPreferences>) => {
    try {
      const response = await enhancedTradingApi.updateTradingPreferences(updates);
      
      // Optimistic update if enabled
      if (FEATURE_FLAGS.useEnhancedServices) {
        hook.refetch();
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update preferences');
    }
  }, [hook]);

  return {
    ...hook,
    updatePreferences,
  };
}

// Real-time market data hook
export function useRealTimeMarketData(symbol: string) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [connected, setConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const subscribe = async () => {
      try {
        const unsubscribe = await enhancedTradingApi.subscribeToSymbol(symbol, (data) => {
          setMarketData(data);
          setConnected(true);
        });
        
        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error('Failed to subscribe to market data:', error);
        setConnected(false);
      }
    };

    subscribe();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setConnected(false);
    };
  }, [symbol]);

  return {
    data: marketData,
    connected,
  };
}

// Trade execution hook with optimistic updates
export function useTradeExecution() {
  const [executing, setExecuting] = useState(false);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeTrade = useCallback(async (tradeData: Omit<Trade, 'id' | 'timestamp' | 'status'>) => {
    setExecuting(true);
    setError(null);

    try {
      // Optimistic update
      if (FEATURE_FLAGS.useEnhancedServices) {
        const optimisticTrade: Trade = {
          ...tradeData,
          id: `temp_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
        };
        setLastTrade(optimisticTrade);
      }

      const response = await enhancedTradingApi.createTrade(tradeData);
      setLastTrade(response.data);
      setExecuting(false);
      
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to execute trade');
      setExecuting(false);
      setLastTrade(null);
      throw error;
    }
  }, []);

  const cancelTrade = useCallback(async (tradeId: string) => {
    try {
      const response = await enhancedTradingApi.cancelTrade(tradeId);
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to cancel trade');
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    executing,
    lastTrade,
    error,
    executeTrade,
    cancelTrade,
    clearError,
  };
}

// Batch operations hook
export function useBatchOperations() {
  const [processing, setProcessing] = useState(false);

  const batchUpdatePositions = useCallback(async (
    updates: Array<{ symbol: string; updates: Partial<any> }>
  ) => {
    setProcessing(true);
    try {
      const response = await enhancedTradingApi.batchUpdatePositions(updates);
      return response.data;
    } finally {
      setProcessing(false);
    }
  }, []);

  const batchCreateTrades = useCallback(async (
    trades: Array<Omit<Trade, 'id' | 'timestamp' | 'status'>>
  ) => {
    setProcessing(true);
    try {
      const response = await enhancedTradingApi.batchCreateTrades(trades);
      return response.data;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processing,
    batchUpdatePositions,
    batchCreateTrades,
  };
}

// Performance metrics hook
export function usePerformanceMetrics(startDate: string, endDate: string) {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getPerformanceMetrics(startDate, endDate);
    return { data: response.data, timestamp: response.timestamp };
  }, [startDate, endDate]);

  return useApi(apiCall, [startDate, endDate], { 
    immediate: Boolean(startDate && endDate),
    retryOnError: true 
  });
}

// Risk metrics hook
export function useRiskMetrics() {
  const apiCall = useCallback(async () => {
    const response = await enhancedTradingApi.getRiskMetrics();
    return { data: response.data, timestamp: response.timestamp };
  }, []);

  return useApi(apiCall, [], { 
    immediate: true,
    refreshInterval: 60000, // Refresh every minute
    retryOnError: true 
  });
}
