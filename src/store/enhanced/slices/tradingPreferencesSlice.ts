// Enhanced Trading Preferences Slice
// Focused state management for trading-specific preferences
// Part of the enhanced state architecture - smaller, more maintainable slices

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// 📈 Trading-specific types
export interface TradingPreferences {
  defaultCurrency: string;
  riskManagement: {
    maxPositionSize: number;
    stopLossDefault: number;
    takeProfitDefault: number;
    maxDailyLoss: number;
  };
  orderDefaults: {
    orderType: 'market' | 'limit' | 'stop';
    timeInForce: 'GTC' | 'IOC' | 'FOK' | 'DAY';
    quantity: number;
  };
  alerts: {
    priceAlerts: boolean;
    orderFills: boolean;
    marginCalls: boolean;
    systemNotifications: boolean;
  };
}

export interface TradingPreferencesState {
  preferences: TradingPreferences;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 🔧 Default trading preferences
const defaultTradingPreferences: TradingPreferences = {
  defaultCurrency: 'USD',
  riskManagement: {
    maxPositionSize: 10000,
    stopLossDefault: 2.0,
    takeProfitDefault: 4.0,
    maxDailyLoss: 500,
  },
  orderDefaults: {
    orderType: 'market',
    timeInForce: 'GTC',
    quantity: 100,
  },
  alerts: {
    priceAlerts: true,
    orderFills: true,
    marginCalls: true,
    systemNotifications: true,
  },
};

const initialState: TradingPreferencesState = {
  preferences: defaultTradingPreferences,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// 🌐 Async thunk for saving trading preferences
export const saveTradingPreferences = createAsyncThunk(
  'trading/savePreferences',
  async (preferences: Partial<TradingPreferences>, { rejectWithValue }) => {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/user/trading-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save trading preferences');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// 📥 Async thunk for loading trading preferences
export const loadTradingPreferences = createAsyncThunk(
  'trading/loadPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/trading-preferences');
      
      if (!response.ok) {
        throw new Error('Failed to load trading preferences');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// 🏪 Enhanced Trading Preferences Slice
export const enhancedTradingPreferencesSlice = createSlice({
  name: 'enhancedTradingPreferences',
  initialState,
  reducers: {
    // Currency settings
    updateDefaultCurrency: (state, action: PayloadAction<string>) => {
      state.preferences.defaultCurrency = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Risk management updates
    updateRiskManagement: (state, action: PayloadAction<Partial<TradingPreferences['riskManagement']>>) => {
      state.preferences.riskManagement = {
        ...state.preferences.riskManagement,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Order defaults updates
    updateOrderDefaults: (state, action: PayloadAction<Partial<TradingPreferences['orderDefaults']>>) => {
      state.preferences.orderDefaults = {
        ...state.preferences.orderDefaults,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Alert preferences updates
    updateAlertPreferences: (state, action: PayloadAction<Partial<TradingPreferences['alerts']>>) => {
      state.preferences.alerts = {
        ...state.preferences.alerts,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Bulk preference update
    updateTradingPreferences: (state, action: PayloadAction<Partial<TradingPreferences>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Reset to defaults
    resetTradingPreferences: (state) => {
      state.preferences = defaultTradingPreferences;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    
    // Clear error
    clearTradingPreferencesError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Save preferences
    builder
      .addCase(saveTradingPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveTradingPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(saveTradingPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Load preferences
    builder
      .addCase(loadTradingPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTradingPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...defaultTradingPreferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadTradingPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 📤 Export actions
export const {
  updateDefaultCurrency,
  updateRiskManagement,
  updateOrderDefaults,
  updateAlertPreferences,
  updateTradingPreferences,
  resetTradingPreferences,
  clearTradingPreferencesError,
} = enhancedTradingPreferencesSlice.actions;

// 📊 Selectors for trading preferences
export const selectTradingPreferences = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.preferences;

export const selectTradingPreferencesLoading = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.isLoading;

export const selectTradingPreferencesError = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.error;

export const selectDefaultCurrency = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.preferences.defaultCurrency;

export const selectRiskManagement = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.preferences.riskManagement;

export const selectOrderDefaults = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.preferences.orderDefaults;

export const selectTradingAlerts = (state: { enhancedTradingPreferences: TradingPreferencesState }) => 
  state.enhancedTradingPreferences.preferences.alerts;

// 🏭 Export reducer
export default enhancedTradingPreferencesSlice.reducer;
