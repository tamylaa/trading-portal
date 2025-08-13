// ⚙️ User Preferences Slice - Personalized, Persistent Settings
// Empowering users with customizable experience

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// 📝 TypeScript Interfaces for Preferences
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

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: {
    decimalPlaces: number;
    thousandsSeparator: ',' | '.' | ' ';
    decimalSeparator: '.' | ',';
  };
  charts: {
    defaultTimeframe: string;
    candlestickStyle: 'candles' | 'bars' | 'line';
    showVolume: boolean;
    showGrid: boolean;
    colorScheme: 'classic' | 'modern' | 'colorblind';
  };
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // minutes
  loginNotifications: boolean;
  autoLogout: boolean;
  allowedDevices: Array<{
    id: string;
    name: string;
    type: string;
    lastUsed: string;
    trusted: boolean;
  }>;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    tradingUpdates: boolean;
    systemAlerts: boolean;
    newsletters: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    priceAlerts: boolean;
    orderUpdates: boolean;
    systemMessages: boolean;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  sms: {
    enabled: boolean;
    criticalOnly: boolean;
    number?: string;
  };
}

export interface PreferencesState {
  // Core preference categories
  trading: TradingPreferences;
  display: DisplayPreferences;
  security: SecurityPreferences;
  notifications: NotificationPreferences;
  
  // Workspace preferences
  workspace: {
    defaultDashboard: string;
    autoSaveInterval: number; // minutes
    backupEnabled: boolean;
    syncAcrossDevices: boolean;
    favoriteInstruments: string[];
    recentSearches: string[];
  };
  
  // Accessibility preferences
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  
  // Performance preferences
  performance: {
    enableAnimations: boolean;
    dataUpdateFrequency: number; // milliseconds
    chartQuality: 'low' | 'medium' | 'high';
    cacheSize: number; // MB
    preloadData: boolean;
  };
  
  // Loading and sync states
  loading: {
    save: boolean;
    load: boolean;
    sync: boolean;
  };
  
  errors: {
    save?: string;
    load?: string;
    sync?: string;
  };
  
  // Metadata
  lastSyncTime?: string;
  version: string;
  isModified: boolean;
}

// 🎯 Initial State
const initialState: PreferencesState = {
  trading: {
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
      quantity: 1000,
    },
    alerts: {
      priceAlerts: true,
      orderFills: true,
      marginCalls: true,
      systemNotifications: true,
    },
  },
  
  display: {
    theme: 'dark',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: {
      decimalPlaces: 4,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    charts: {
      defaultTimeframe: '1H',
      candlestickStyle: 'candles',
      showVolume: true,
      showGrid: true,
      colorScheme: 'modern',
    },
  },
  
  security: {
    twoFactorEnabled: false,
    biometricEnabled: false,
    sessionTimeout: 60,
    loginNotifications: true,
    autoLogout: true,
    allowedDevices: [],
  },
  
  notifications: {
    email: {
      enabled: true,
      tradingUpdates: true,
      systemAlerts: true,
      newsletters: false,
      frequency: 'immediate',
    },
    push: {
      enabled: true,
      priceAlerts: true,
      orderUpdates: true,
      systemMessages: true,
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    sms: {
      enabled: false,
      criticalOnly: true,
    },
  },
  
  workspace: {
    defaultDashboard: 'default',
    autoSaveInterval: 5,
    backupEnabled: true,
    syncAcrossDevices: true,
    favoriteInstruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
    recentSearches: [],
  },
  
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    colorBlindSupport: 'none',
  },
  
  performance: {
    enableAnimations: true,
    dataUpdateFrequency: 5000,
    chartQuality: 'high',
    cacheSize: 50,
    preloadData: true,
  },
  
  loading: {
    save: false,
    load: false,
    sync: false,
  },
  
  errors: {},
  
  version: '1.0.0',
  isModified: false,
};

// 🚀 Async Thunks
export const loadPreferences = createAsyncThunk(
  'preferences/load',
  async (_, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        return { ...initialState, ...preferences };
      }
      return initialState;
    } catch (error: any) {
      return rejectWithValue('Failed to load preferences');
    }
  }
);

export const savePreferences = createAsyncThunk(
  'preferences/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { preferences: PreferencesState };
      const preferencesToSave = {
        ...state.preferences,
        lastSyncTime: new Date().toISOString(),
        isModified: false,
      };
      
      localStorage.setItem('user-preferences', JSON.stringify(preferencesToSave));
      return preferencesToSave;
    } catch (error: any) {
      return rejectWithValue('Failed to save preferences');
    }
  }
);

export const syncPreferences = createAsyncThunk(
  'preferences/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { preferences: PreferencesState };
      // In a real app, this would sync with a server
      // For now, just simulate the sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...state.preferences,
        lastSyncTime: new Date().toISOString(),
        isModified: false,
      };
    } catch (error: any) {
      return rejectWithValue('Failed to sync preferences');
    }
  }
);

// ⚙️ Preferences Slice
export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    // 💱 Trading Preferences
    updateTradingPreferences: (state, action: PayloadAction<Partial<TradingPreferences>>) => {
      state.trading = { ...state.trading, ...action.payload };
      state.isModified = true;
    },
    
    updateRiskManagement: (state, action: PayloadAction<Partial<TradingPreferences['riskManagement']>>) => {
      state.trading.riskManagement = { ...state.trading.riskManagement, ...action.payload };
      state.isModified = true;
    },
    
    updateOrderDefaults: (state, action: PayloadAction<Partial<TradingPreferences['orderDefaults']>>) => {
      state.trading.orderDefaults = { ...state.trading.orderDefaults, ...action.payload };
      state.isModified = true;
    },
    
    // 🎨 Display Preferences
    updateDisplayPreferences: (state, action: PayloadAction<Partial<DisplayPreferences>>) => {
      state.display = { ...state.display, ...action.payload };
      state.isModified = true;
    },
    
    setTheme: (state, action: PayloadAction<DisplayPreferences['theme']>) => {
      state.display.theme = action.payload;
      state.isModified = true;
    },
    
    setLanguage: (state, action: PayloadAction<string>) => {
      state.display.language = action.payload;
      state.isModified = true;
    },
    
    updateChartPreferences: (state, action: PayloadAction<Partial<DisplayPreferences['charts']>>) => {
      state.display.charts = { ...state.display.charts, ...action.payload };
      state.isModified = true;
    },
    
    // 🔒 Security Preferences
    updateSecurityPreferences: (state, action: PayloadAction<Partial<SecurityPreferences>>) => {
      state.security = { ...state.security, ...action.payload };
      state.isModified = true;
    },
    
    addTrustedDevice: (state, action: PayloadAction<{
      id: string;
      name: string;
      type: string;
    }>) => {
      const device = {
        ...action.payload,
        lastUsed: new Date().toISOString(),
        trusted: true,
      };
      state.security.allowedDevices.push(device);
      state.isModified = true;
    },
    
    removeTrustedDevice: (state, action: PayloadAction<string>) => {
      state.security.allowedDevices = state.security.allowedDevices.filter(
        device => device.id !== action.payload
      );
      state.isModified = true;
    },
    
    // 📢 Notification Preferences
    updateNotificationPreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
      state.isModified = true;
    },
    
    toggleEmailNotifications: (state) => {
      state.notifications.email.enabled = !state.notifications.email.enabled;
      state.isModified = true;
    },
    
    togglePushNotifications: (state) => {
      state.notifications.push.enabled = !state.notifications.push.enabled;
      state.isModified = true;
    },
    
    // 🏢 Workspace Preferences
    updateWorkspacePreferences: (state, action: PayloadAction<Partial<PreferencesState['workspace']>>) => {
      state.workspace = { ...state.workspace, ...action.payload };
      state.isModified = true;
    },
    
    addFavoriteInstrument: (state, action: PayloadAction<string>) => {
      if (!state.workspace.favoriteInstruments.includes(action.payload)) {
        state.workspace.favoriteInstruments.push(action.payload);
        state.isModified = true;
      }
    },
    
    removeFavoriteInstrument: (state, action: PayloadAction<string>) => {
      state.workspace.favoriteInstruments = state.workspace.favoriteInstruments.filter(
        instrument => instrument !== action.payload
      );
      state.isModified = true;
    },
    
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const searches = state.workspace.recentSearches.filter(s => s !== action.payload);
      searches.unshift(action.payload);
      state.workspace.recentSearches = searches.slice(0, 10); // Keep only 10 recent searches
      state.isModified = true;
    },
    
    // ♿ Accessibility Preferences
    updateAccessibilityPreferences: (state, action: PayloadAction<Partial<PreferencesState['accessibility']>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
      state.isModified = true;
    },
    
    toggleHighContrast: (state) => {
      state.accessibility.highContrast = !state.accessibility.highContrast;
      state.isModified = true;
    },
    
    toggleReduceMotion: (state) => {
      state.accessibility.reduceMotion = !state.accessibility.reduceMotion;
      state.isModified = true;
    },
    
    // ⚡ Performance Preferences
    updatePerformancePreferences: (state, action: PayloadAction<Partial<PreferencesState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
      state.isModified = true;
    },
    
    // 🧹 Utility Actions
    resetToDefaults: (state) => {
      return { ...initialState, isModified: true };
    },
    
    clearErrors: (state) => {
      state.errors = {};
    },
    
    markAsModified: (state) => {
      state.isModified = true;
    },
  },
  
  extraReducers: (builder) => {
    // Load Preferences
    builder
      .addCase(loadPreferences.pending, (state) => {
        state.loading.load = true;
        delete state.errors.load;
      })
      .addCase(loadPreferences.fulfilled, (state, action) => {
        state.loading.load = false;
        return { ...action.payload, loading: state.loading };
      })
      .addCase(loadPreferences.rejected, (state, action) => {
        state.loading.load = false;
        state.errors.load = action.payload as string;
      });
    
    // Save Preferences
    builder
      .addCase(savePreferences.pending, (state) => {
        state.loading.save = true;
        delete state.errors.save;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.loading.save = false;
        state.lastSyncTime = action.payload.lastSyncTime;
        state.isModified = false;
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.loading.save = false;
        state.errors.save = action.payload as string;
      });
    
    // Sync Preferences
    builder
      .addCase(syncPreferences.pending, (state) => {
        state.loading.sync = true;
        delete state.errors.sync;
      })
      .addCase(syncPreferences.fulfilled, (state, action) => {
        state.loading.sync = false;
        state.lastSyncTime = action.payload.lastSyncTime;
        state.isModified = false;
      })
      .addCase(syncPreferences.rejected, (state, action) => {
        state.loading.sync = false;
        state.errors.sync = action.payload as string;
      });
  },
});

// 🎯 Action Creators Export
export const {
  updateTradingPreferences,
  updateRiskManagement,
  updateOrderDefaults,
  updateDisplayPreferences,
  setTheme,
  setLanguage,
  updateChartPreferences,
  updateSecurityPreferences,
  addTrustedDevice,
  removeTrustedDevice,
  updateNotificationPreferences,
  toggleEmailNotifications,
  togglePushNotifications,
  updateWorkspacePreferences,
  addFavoriteInstrument,
  removeFavoriteInstrument,
  addRecentSearch,
  updateAccessibilityPreferences,
  toggleHighContrast,
  toggleReduceMotion,
  updatePerformancePreferences,
  resetToDefaults,
  clearErrors,
  markAsModified,
} = preferencesSlice.actions;

// 🔍 Selectors
export const selectPreferences = (state: { preferences: PreferencesState }) => state.preferences;
export const selectTradingPreferences = (state: { preferences: PreferencesState }) => state.preferences.trading;
export const selectDisplayPreferences = (state: { preferences: PreferencesState }) => state.preferences.display;
export const selectSecurityPreferences = (state: { preferences: PreferencesState }) => state.preferences.security;
export const selectNotificationPreferences = (state: { preferences: PreferencesState }) => state.preferences.notifications;
export const selectWorkspacePreferences = (state: { preferences: PreferencesState }) => state.preferences.workspace;
export const selectAccessibilityPreferences = (state: { preferences: PreferencesState }) => state.preferences.accessibility;
export const selectPerformancePreferences = (state: { preferences: PreferencesState }) => state.preferences.performance;
export const selectPreferencesLoading = (state: { preferences: PreferencesState }) => state.preferences.loading;
export const selectPreferencesErrors = (state: { preferences: PreferencesState }) => state.preferences.errors;
export const selectIsPreferencesModified = (state: { preferences: PreferencesState }) => state.preferences.isModified;
export const selectLastSyncTime = (state: { preferences: PreferencesState }) => state.preferences.lastSyncTime;

export default preferencesSlice.reducer;
