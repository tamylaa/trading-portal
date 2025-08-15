// Enhanced Store Configuration
// Progressive enhancement approach - works alongside existing store
// Feature flag controlled integration

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Enhanced slices
import enhancedTradingPreferencesReducer from './slices/tradingPreferencesSlice';
import enhancedDisplayPreferencesReducer from './slices/displayPreferencesSlice';

// Enhanced store state interface
export interface EnhancedRootState {
  enhancedTradingPreferences: ReturnType<typeof enhancedTradingPreferencesReducer>;
  enhancedDisplayPreferences: ReturnType<typeof enhancedDisplayPreferencesReducer>;
}

// Enhanced reducers combination
const enhancedRootReducer = combineReducers({
  enhancedTradingPreferences: enhancedTradingPreferencesReducer,
  enhancedDisplayPreferences: enhancedDisplayPreferencesReducer,
});

// Persistence configuration for enhanced store
const enhancedPersistConfig = {
  key: 'enhanced-root',
  storage,
  whitelist: ['enhancedTradingPreferences', 'enhancedDisplayPreferences'],
  version: 1,
};

// Persisted enhanced reducer
const enhancedPersistedReducer = persistReducer(enhancedPersistConfig, enhancedRootReducer);

// Enhanced store configuration
export const configureEnhancedStore = () => {
  return configureStore({
    reducer: enhancedPersistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Enhanced store type
export type EnhancedStore = ReturnType<typeof configureEnhancedStore>;
export type EnhancedAppDispatch = EnhancedStore['dispatch'];

// Store integration utilities
export const isEnhancedStoreEnabled = () => {
  // Check feature flags or environment variables
  return process.env.REACT_APP_ENHANCED_STORE === 'true' || 
         localStorage.getItem('useEnhancedStore') === 'true';
};

// Migration utilities for progressive enhancement
export const migrateToEnhancedStore = (legacyState: any) => {
  // Migrate legacy preferences to enhanced structure
  if (legacyState?.preferences) {
    return {
      enhancedTradingPreferences: {
        preferences: {
          defaultCurrency: legacyState.preferences.trading?.defaultCurrency || 'USD',
          riskManagement: legacyState.preferences.trading?.riskManagement || {},
          orderDefaults: legacyState.preferences.trading?.orderDefaults || {},
          alerts: legacyState.preferences.trading?.alerts || {},
        },
        isLoading: false,
        error: null,
        lastUpdated: null,
      },
      enhancedDisplayPreferences: {
        preferences: {
          theme: legacyState.preferences.display?.theme || 'auto',
          language: legacyState.preferences.display?.language || 'en-US',
          timezone: legacyState.preferences.display?.timezone || 'UTC',
          dateFormat: legacyState.preferences.display?.dateFormat || 'MM/DD/YYYY',
          numberFormat: legacyState.preferences.display?.numberFormat || {},
          charts: legacyState.preferences.display?.charts || {},
          layout: legacyState.preferences.display?.layout || {},
        },
        isLoading: false,
        error: null,
        lastUpdated: null,
      },
    };
  }
  
  return {};
};
