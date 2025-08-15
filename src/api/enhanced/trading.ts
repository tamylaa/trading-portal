// Enhanced Trading API
// Specialized API endpoints for trading operations with TypeScript types
// Progressive enhancement - integrates with enhanced state management

import { enhancedApiClient, ApiResponse } from './client';
import { FEATURE_FLAGS } from '../../config/features';

// Trading data types
export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  orderId?: string;
  executedQuantity?: number;
  averagePrice?: number;
  fees?: number;
  commission?: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  lastUpdated: string;
}

export interface Portfolio {
  totalValue: number;
  cashBalance: number;
  positions: Position[];
  dayChange: number;
  dayChangePercent: number;
  lastUpdated: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
}

export interface TradingPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  tradingStyle: 'day' | 'swing' | 'position';
  maxPositionSize: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  autoRebalance: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  chartTimeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
}

// Enhanced Trading API class
export class EnhancedTradingApi {
  private client = enhancedApiClient;

  // Trading operations
  async getTrades(params?: {
    symbol?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Trade[]>> {
    const queryParams = new URLSearchParams();
    if (params?.symbol) queryParams.append('symbol', params.symbol);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `/trades${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get<Trade[]>(url);
  }

  async createTrade(trade: Omit<Trade, 'id' | 'timestamp' | 'status'>): Promise<ApiResponse<Trade>> {
    return this.client.post<Trade>('/trades', trade);
  }

  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<ApiResponse<Trade>> {
    return this.client.patch<Trade>(`/trades/${tradeId}`, updates);
  }

  async cancelTrade(tradeId: string): Promise<ApiResponse<Trade>> {
    return this.client.patch<Trade>(`/trades/${tradeId}/cancel`, {});
  }

  // Portfolio operations
  async getPortfolio(): Promise<ApiResponse<Portfolio>> {
    return this.client.get<Portfolio>('/portfolio');
  }

  async getPositions(): Promise<ApiResponse<Position[]>> {
    return this.client.get<Position[]>('/portfolio/positions');
  }

  async getPosition(symbol: string): Promise<ApiResponse<Position>> {
    return this.client.get<Position>(`/portfolio/positions/${symbol}`);
  }

  // Market data operations
  async getMarketData(symbols: string[]): Promise<ApiResponse<MarketData[]>> {
    const symbolsParam = symbols.join(',');
    return this.client.get<MarketData[]>(`/market/data?symbols=${symbolsParam}`);
  }

  async getQuote(symbol: string): Promise<ApiResponse<MarketData>> {
    return this.client.get<MarketData>(`/market/quote/${symbol}`);
  }

  async getHistoricalData(
    symbol: string,
    timeframe: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(
      `/market/historical/${symbol}?timeframe=${timeframe}&start=${startDate}&end=${endDate}`
    );
  }

  // Preferences operations
  async getTradingPreferences(): Promise<ApiResponse<TradingPreferences>> {
    return this.client.get<TradingPreferences>('/preferences/trading');
  }

  async updateTradingPreferences(preferences: Partial<TradingPreferences>): Promise<ApiResponse<TradingPreferences>> {
    return this.client.patch<TradingPreferences>('/preferences/trading', preferences);
  }

  // Real-time operations (enhanced features)
  async subscribeToSymbol(symbol: string, callback: (data: MarketData) => void): Promise<() => void> {
    if (!FEATURE_FLAGS.useEnhancedServices) {
      // Fallback to polling for non-enhanced mode
      const interval = setInterval(async () => {
        try {
          const response = await this.getQuote(symbol);
          callback(response.data);
        } catch (error) {
          console.warn('Polling failed for symbol:', symbol, error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }

    // Enhanced WebSocket subscription (when available)
    try {
      const ws = new WebSocket(`ws://localhost:3001/ws/market/${symbol}`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling');
      // Fallback to polling
      const interval = setInterval(async () => {
        try {
          const response = await this.getQuote(symbol);
          callback(response.data);
        } catch (error) {
          console.warn('Polling failed for symbol:', symbol, error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }

  // Batch operations for performance
  async batchUpdatePositions(updates: Array<{ symbol: string; updates: Partial<Position> }>): Promise<ApiResponse<Position[]>> {
    return this.client.post<Position[]>('/portfolio/positions/batch', { updates });
  }

  async batchCreateTrades(trades: Array<Omit<Trade, 'id' | 'timestamp' | 'status'>>): Promise<ApiResponse<Trade[]>> {
    return this.client.post<Trade[]>('/trades/batch', { trades });
  }

  // Analytics and reporting
  async getPerformanceMetrics(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return this.client.get<any>(`/analytics/performance?start=${startDate}&end=${endDate}`);
  }

  async getRiskMetrics(): Promise<ApiResponse<any>> {
    return this.client.get<any>('/analytics/risk');
  }

  // Cache management
  clearMarketDataCache(): void {
    this.client.removeCacheEntry('/market/data');
    this.client.removeCacheEntry('/portfolio');
  }

  clearAllCache(): void {
    this.client.clearCache();
  }
}

// Singleton instance
export const enhancedTradingApi = new EnhancedTradingApi();

// Feature flag aware trading API
export const getTradingApi = () => {
  if (FEATURE_FLAGS.useEnhancedServices) {
    return enhancedTradingApi;
  }
  
  // Legacy API wrapper (simplified interface)
  return {
    getTrades: async () => {
      const response = await fetch('/api/trades');
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
    getPortfolio: async () => {
      const response = await fetch('/api/portfolio');
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
    getMarketData: async (symbols: string[]) => {
      const response = await fetch(`/api/market/data?symbols=${symbols.join(',')}`);
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
    createTrade: async (trade: any) => {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
      });
      const data = await response.json();
      return { data, status: response.status, timestamp: new Date().toISOString() };
    },
  };
};

// Types are already exported as interfaces above
// No need for explicit type exports since they're declared as interfaces
