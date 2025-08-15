// Enhanced Display Preferences Slice
// Focused state management for UI/display preferences
// Part of the enhanced state architecture - smaller, more maintainable slices

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// 🎨 Display-specific types
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
  layout: {
    sidebarPosition: 'left' | 'right';
    compactMode: boolean;
    showTooltips: boolean;
    animationsEnabled: boolean;
  };
}

export interface DisplayPreferencesState {
  preferences: DisplayPreferences;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 🎨 Default display preferences
const defaultDisplayPreferences: DisplayPreferences = {
  theme: 'auto',
  language: 'en-US',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: {
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  charts: {
    defaultTimeframe: '1D',
    candlestickStyle: 'candles',
    showVolume: true,
    showGrid: true,
    colorScheme: 'modern',
  },
  layout: {
    sidebarPosition: 'left',
    compactMode: false,
    showTooltips: true,
    animationsEnabled: true,
  },
};

const initialState: DisplayPreferencesState = {
  preferences: defaultDisplayPreferences,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// 🌐 Async thunk for saving display preferences
export const saveDisplayPreferences = createAsyncThunk(
  'display/savePreferences',
  async (preferences: Partial<DisplayPreferences>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/display-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save display preferences');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// 📥 Async thunk for loading display preferences
export const loadDisplayPreferences = createAsyncThunk(
  'display/loadPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/display-preferences');
      
      if (!response.ok) {
        throw new Error('Failed to load display preferences');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// 🏪 Enhanced Display Preferences Slice
export const enhancedDisplayPreferencesSlice = createSlice({
  name: 'enhancedDisplayPreferences',
  initialState,
  reducers: {
    // Theme settings
    updateTheme: (state, action: PayloadAction<DisplayPreferences['theme']>) => {
      state.preferences.theme = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Language and localization
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateTimezone: (state, action: PayloadAction<string>) => {
      state.preferences.timezone = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateDateFormat: (state, action: PayloadAction<string>) => {
      state.preferences.dateFormat = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Number formatting
    updateNumberFormat: (state, action: PayloadAction<Partial<DisplayPreferences['numberFormat']>>) => {
      state.preferences.numberFormat = {
        ...state.preferences.numberFormat,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Chart preferences
    updateChartPreferences: (state, action: PayloadAction<Partial<DisplayPreferences['charts']>>) => {
      state.preferences.charts = {
        ...state.preferences.charts,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Layout preferences
    updateLayoutPreferences: (state, action: PayloadAction<Partial<DisplayPreferences['layout']>>) => {
      state.preferences.layout = {
        ...state.preferences.layout,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Bulk preference update
    updateDisplayPreferences: (state, action: PayloadAction<Partial<DisplayPreferences>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },
    
    // Reset to defaults
    resetDisplayPreferences: (state) => {
      state.preferences = defaultDisplayPreferences;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    
    // Toggle specific features
    toggleCompactMode: (state) => {
      state.preferences.layout.compactMode = !state.preferences.layout.compactMode;
      state.lastUpdated = new Date().toISOString();
    },
    
    toggleAnimations: (state) => {
      state.preferences.layout.animationsEnabled = !state.preferences.layout.animationsEnabled;
      state.lastUpdated = new Date().toISOString();
    },
    
    toggleTooltips: (state) => {
      state.preferences.layout.showTooltips = !state.preferences.layout.showTooltips;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Clear error
    clearDisplayPreferencesError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Save preferences
    builder
      .addCase(saveDisplayPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDisplayPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(saveDisplayPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Load preferences
    builder
      .addCase(loadDisplayPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDisplayPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...defaultDisplayPreferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadDisplayPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 📤 Export actions
export const {
  updateTheme,
  updateLanguage,
  updateTimezone,
  updateDateFormat,
  updateNumberFormat,
  updateChartPreferences,
  updateLayoutPreferences,
  updateDisplayPreferences,
  resetDisplayPreferences,
  toggleCompactMode,
  toggleAnimations,
  toggleTooltips,
  clearDisplayPreferencesError,
} = enhancedDisplayPreferencesSlice.actions;

// 📊 Selectors for display preferences
export const selectDisplayPreferences = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences;

export const selectDisplayPreferencesLoading = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.isLoading;

export const selectDisplayPreferencesError = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.error;

export const selectTheme = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences.theme;

export const selectLanguage = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences.language;

export const selectChartPreferences = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences.charts;

export const selectLayoutPreferences = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences.layout;

export const selectNumberFormat = (state: { enhancedDisplayPreferences: DisplayPreferencesState }) => 
  state.enhancedDisplayPreferences.preferences.numberFormat;

// 🏭 Export reducer
export default enhancedDisplayPreferencesSlice.reducer;
