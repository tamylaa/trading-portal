// 🌐 API Slice - Efficient Data Fetching with RTK Query
// Powerful, cached, real-time data management

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// 📝 TypeScript Interfaces for API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MarketPrice {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: string;
  change: number;
  changePercent: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled';
  fee: number;
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
    marketValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
  }>;
  performance: {
    totalReturn: number;
    totalReturnPercent: number;
    dayChange: number;
    dayChangePercent: number;
  };
}

// 🚀 Enhanced API Slice with Caching and Real-time Updates
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token from Redux state
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Add common headers
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      return headers;
    },
  }),
  
  // 🏷️ Tag Types for Cache Invalidation
  tagTypes: [
    'User',
    'Portfolio',
    'Trades',
    'MarketData',
    'Orders',
    'Positions',
    'Analytics',
    'News',
    'Alerts',
  ],
  
  endpoints: (builder) => ({
    // 🔐 Authentication Endpoints
    getCurrentUser: builder.query<ApiResponse<any>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
      // Refetch every 5 minutes to keep user data fresh (handled by polling in component if needed)
    }),
    
    updateProfile: builder.mutation<ApiResponse<any>, Partial<any>>({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
      // Optimistic updates for better UX
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Optimistically update the cache
          dispatch(
            apiSlice.util.updateQueryData('getCurrentUser', undefined, (draft) => {
              if (draft.data) {
                Object.assign(draft.data, arg);
              }
            })
          );
        } catch {
          // Revert optimistic update on error
        }
      },
    }),
    
    // 📊 Portfolio Endpoints
    getPortfolio: builder.query<ApiResponse<Portfolio>, void>({
      query: () => '/portfolio',
      providesTags: ['Portfolio'],
      // Real-time updates every 30 seconds (handled by polling in component if needed)
    }),
    
    getPositions: builder.query<ApiResponse<any[]>, void>({
      query: () => '/portfolio/positions',
      providesTags: ['Positions'],
      // pollingInterval removed
    }),
    
    // 💹 Trading Endpoints
    getTrades: builder.query<ApiResponse<PaginatedResponse<Trade>>, {
      page?: number;
      limit?: number;
      symbol?: string;
      status?: string;
    }>({
      query: (params = {}) => ({
        url: '/trades',
        params,
      }),
      providesTags: ['Trades'],
      // Merge new data with existing cache for pagination
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        // Merge the data arrays inside PaginatedResponse<Trade>
        if (
          currentCache.data &&
          newItems.data &&
          Array.isArray(currentCache.data.data) &&
          Array.isArray(newItems.data.data)
        ) {
          return {
            ...newItems,
            data: {
              ...newItems.data,
              data: [...currentCache.data.data, ...newItems.data.data],
              pagination: newItems.data.pagination || currentCache.data.pagination,
            },
          };
        }
        return newItems;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    
    createOrder: builder.mutation<ApiResponse<any>, {
      symbol: string;
      side: 'buy' | 'sell';
      type: 'market' | 'limit';
      quantity: number;
      price?: number;
    }>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders', 'Portfolio', 'Positions'],
      // Optimistic updates for order creation
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const optimisticOrder = {
          id: `temp-${Date.now()}`,
          ...arg,
          status: 'pending' as const,
          timestamp: new Date().toISOString(),
          fee: 0,
        };
        // Optimistically add to trades cache
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getTrades', {}, (draft) => {
            if (Array.isArray(draft.data)) {
              draft.data.unshift(optimisticOrder);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
    }),
    
    // 📈 Market Data Endpoints
    getMarketPrices: builder.query<ApiResponse<MarketPrice[]>, string[]>({
      query: (symbols) => ({
        url: '/market/prices',
        params: { symbols: symbols.join(',') },
      }),
      providesTags: ['MarketData'],
      // pollingInterval removed
    }),
    
    getChartData: builder.query<ApiResponse<any>, {
      symbol: string;
      timeframe: string;
      from?: string;
      to?: string;
    }>({
      query: ({ symbol, timeframe, from, to }) => ({
        url: `/market/chart/${symbol}`,
        params: { timeframe, from, to },
      }),
      providesTags: ['MarketData'],
      // Cache chart data for 1 minute
      keepUnusedDataFor: 60,
    }),
    
    // 📰 News and Analytics
    getMarketNews: builder.query<ApiResponse<any[]>, {
      category?: string;
      limit?: number;
    }>({
      query: (params = {}) => ({
        url: '/news',
        params,
      }),
      providesTags: ['News'],
      // pollingInterval removed
    }),
    
    getAnalytics: builder.query<ApiResponse<any>, {
      period?: string;
      metrics?: string[];
    }>({
      query: (params = {}) => ({
        url: '/analytics',
        params,
      }),
      providesTags: ['Analytics'],
      // pollingInterval removed
    }),
    
    // 🔔 Alerts and Notifications
    getAlerts: builder.query<ApiResponse<any[]>, void>({
      query: () => '/alerts',
      providesTags: ['Alerts'],
    }),
    
    createAlert: builder.mutation<ApiResponse<any>, {
      symbol: string;
      condition: 'above' | 'below';
      price: number;
      type: 'price' | 'change';
    }>({
      query: (alertData) => ({
        url: '/alerts',
        method: 'POST',
        body: alertData,
      }),
      invalidatesTags: ['Alerts'],
    }),
    
    deleteAlert: builder.mutation<ApiResponse<void>, string>({
      query: (alertId) => ({
        url: `/alerts/${alertId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Alerts'],
    }),
  }),
});

// 🎯 Export Auto-generated Hooks
export const {
  // Auth hooks
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  
  // Portfolio hooks
  useGetPortfolioQuery,
  useGetPositionsQuery,
  
  // Trading hooks
  useGetTradesQuery,
  useCreateOrderMutation,
  
  // Market data hooks
  useGetMarketPricesQuery,
  useGetChartDataQuery,
  
  // News and analytics hooks
  useGetMarketNewsQuery,
  useGetAnalyticsQuery,
  
  // Alerts hooks
  useGetAlertsQuery,
  useCreateAlertMutation,
  useDeleteAlertMutation,
} = apiSlice;

// 🔧 Enhanced Error Handling
export const apiErrorHandler = (error: any) => {
  if (error?.status === 401) {
    // Handle unauthorized - redirect to login
    window.location.href = '/login';
    return 'Session expired. Please log in again.';
  }
  
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error?.data?.message) {
    return error.data.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// 🚀 Real-time WebSocket Integration Helper
export const createWebSocketConnection = (endpoint: string, token: string) => {
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
  const ws = new WebSocket(`${wsUrl}/${endpoint}?token=${token}`);
  
  ws.onopen = () => {
    console.log(`WebSocket connected to ${endpoint}`);
  };
  
  ws.onerror = (error) => {
    console.error(`WebSocket error on ${endpoint}:`, error);
  };
  
  ws.onclose = () => {
    console.log(`WebSocket disconnected from ${endpoint}`);
    // Implement reconnection logic here
  };
  
  return ws;
};

export default apiSlice;
