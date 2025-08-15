// Enhanced API Index
// Central export point for enhanced API functionality
// Progressive enhancement - provides unified access to enhanced services

export * from './client';
export * from './trading';
export * from './hooks';

// Re-export key utilities for convenience
export { getApiClient } from './client';
export { getTradingApi } from './trading';

// Enhanced API utilities
export const apiUtils = {
  // Format currency values
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  // Format percentage values
  formatPercentage: (value: number, decimals: number = 2): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Format large numbers
  formatNumber: (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  },

  // Calculate profit/loss
  calculatePnL: (currentPrice: number, averagePrice: number, quantity: number) => {
    const unrealized = (currentPrice - averagePrice) * quantity;
    const percentage = ((currentPrice - averagePrice) / averagePrice) * 100;
    return { unrealized, percentage };
  },

  // Validate trading parameters
  validateTrade: (trade: any) => {
    const errors: string[] = [];
    
    if (!trade.symbol) errors.push('Symbol is required');
    if (!trade.side || !['buy', 'sell'].includes(trade.side)) errors.push('Valid side (buy/sell) is required');
    if (!trade.quantity || trade.quantity <= 0) errors.push('Positive quantity is required');
    if (!trade.price || trade.price <= 0) errors.push('Positive price is required');
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Generate mock data for development
  generateMockTrade: () => ({
    symbol: 'AAPL',
    side: Math.random() > 0.5 ? 'buy' : 'sell',
    quantity: Math.floor(Math.random() * 100) + 1,
    price: 150 + Math.random() * 50,
  }),

  generateMockMarketData: (symbol: string) => ({
    symbol,
    price: 100 + Math.random() * 100,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 0.1,
    volume: Math.floor(Math.random() * 1000000),
    high: 100 + Math.random() * 110,
    low: 90 + Math.random() * 90,
    open: 95 + Math.random() * 95,
    timestamp: new Date().toISOString(),
  }),
};

// Development utilities
export const devUtils = {
  // Enable debug mode for API calls
  enableDebugMode: () => {
    if (process.env.NODE_ENV === 'development') {
      window.localStorage.setItem('api-debug', 'true');
      console.log('API debug mode enabled');
    }
  },

  // Disable debug mode
  disableDebugMode: () => {
    window.localStorage.removeItem('api-debug');
    console.log('API debug mode disabled');
  },

  // Check if debug mode is active
  isDebugMode: () => {
    return process.env.NODE_ENV === 'development' && 
           window.localStorage.getItem('api-debug') === 'true';
  },

  // Log API calls in debug mode
  logApiCall: (method: string, url: string, data?: any) => {
    if (devUtils.isDebugMode()) {
      console.group(`🔌 API ${method.toUpperCase()}: ${url}`);
      if (data) console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  },

  // Simulate network latency
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Feature flag integration helper
export const featureUtils = {
  // Check if enhanced APIs are available
  isEnhanced: () => {
    const FEATURE_FLAGS = require('../../config/features').FEATURE_FLAGS;
    return FEATURE_FLAGS.useEnhancedServices;
  },

  // Get appropriate API client based on feature flags
  getClient: () => {
    const { getApiClient } = require('./client');
    return getApiClient();
  },

  // Get appropriate trading API based on feature flags
  getTradingClient: () => {
    const { getTradingApi } = require('./trading');
    return getTradingApi();
  },
};
