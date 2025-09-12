// 📊 Dashboard Slice - Modular, Customizable Dashboard State
// Empowering users with personalized trading experience

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// 📝 TypeScript Interfaces for Dashboard
export interface Widget {
  id: string;
  type: 'chart' | 'portfolio' | 'trades' | 'news' | 'calendar' | 'watchlist' | 'metrics';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: any;
  settings: {
    refreshInterval?: number;
    showHeader?: boolean;
    theme?: 'light' | 'dark';
    customProps?: Record<string, any>;
  };
  isVisible: boolean;
  lastUpdated?: string;
}

export interface Layout {
  id: string;
  name: string;
  widgets: Widget[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPreferences {
  defaultLayout: string;
  autoSave: boolean;
  refreshInterval: number;
  animations: boolean;
  compactMode: boolean;
  gridSize: 'small' | 'medium' | 'large';
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
}

export interface DashboardState {
  // Layout Management
  layouts: Layout[];
  activeLayoutId: string;
  isEditing: boolean;
  
  // Widget Management
  availableWidgets: Array<{
    type: Widget['type'];
    name: string;
    description: string;
    defaultSize: { w: number; h: number };
    category: 'trading' | 'analytics' | 'news' | 'portfolio';
  }>;
  
  // Real-time Data
  marketData: { [symbol: string]: MarketData };
  portfolioData: {
    totalValue: number;
    todayChange: number;
    todayChangePercent: number;
    positions: Array<{
      symbol: string;
      quantity: number;
      avgPrice: number;
      currentPrice: number;
      unrealizedPnL: number;
    }>;
  };
  
  // User Preferences
  preferences: DashboardPreferences;
  
  // Loading and Error States
  loading: {
    layouts: boolean;
    marketData: boolean;
    portfolio: boolean;
    widgets: boolean;
  };
  
  errors: {
    layouts?: string;
    marketData?: string;
    portfolio?: string;
  };
  
  // Performance Metrics
  performance: {
    lastUpdateTime: string;
    updateFrequency: number;
    dataAge: { [key: string]: number };
  };
}

// 🎯 Initial State
const initialState: DashboardState = {
  layouts: [],
  activeLayoutId: '',
  isEditing: false,
  
  availableWidgets: [
    {
      type: 'portfolio',
      name: 'Portfolio Overview',
      description: 'Your portfolio balance and performance',
      defaultSize: { w: 6, h: 4 },
      category: 'portfolio',
    },
    {
      type: 'chart',
      name: 'Trading Chart',
      description: 'Interactive price charts',
      defaultSize: { w: 8, h: 6 },
      category: 'trading',
    },
    {
      type: 'trades',
      name: 'Recent Trades',
      description: 'Your latest trading activity',
      defaultSize: { w: 6, h: 4 },
      category: 'trading',
    },
    {
      type: 'watchlist',
      name: 'Watchlist',
      description: 'Monitor your favorite instruments',
      defaultSize: { w: 4, h: 6 },
      category: 'trading',
    },
    {
      type: 'news',
      name: 'Market News',
      description: 'Latest market news and updates',
      defaultSize: { w: 6, h: 4 },
      category: 'news',
    },
    {
      type: 'metrics',
      name: 'Performance Metrics',
      description: 'Trading statistics and analytics',
      defaultSize: { w: 4, h: 3 },
      category: 'analytics',
    },
  ],
  
  marketData: {},
  portfolioData: {
    totalValue: 0,
    todayChange: 0,
    todayChangePercent: 0,
    positions: [],
  },
  
  preferences: {
    defaultLayout: 'default',
    autoSave: true,
    refreshInterval: 5000,
    animations: true,
    compactMode: false,
    gridSize: 'medium',
  },
  
  loading: {
    layouts: false,
    marketData: false,
    portfolio: false,
    widgets: false,
  },
  
  errors: {},
  
  performance: {
    lastUpdateTime: new Date().toISOString(),
    updateFrequency: 0,
    dataAge: {},
  },
};

// 🚀 Async Thunks for Data Fetching
export const loadDashboardLayouts = createAsyncThunk(
  'dashboard/loadLayouts',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would fetch from API
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      if (savedLayouts) {
        return JSON.parse(savedLayouts);
      }
      
      // Return default layout if none saved
      return [{
        id: 'default',
        name: 'Default Layout',
        widgets: [
          {
            id: 'portfolio-1',
            type: 'portfolio',
            title: 'Portfolio Overview',
            position: { x: 0, y: 0, w: 6, h: 4 },
            settings: { refreshInterval: 30000, showHeader: true },
            isVisible: true,
          },
          {
            id: 'chart-1',
            type: 'chart',
            title: 'EURUSD Chart',
            position: { x: 6, y: 0, w: 6, h: 4 },
            settings: { refreshInterval: 5000, showHeader: true },
            isVisible: true,
          },
        ],
        isDefault: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    } catch (error: any) {
      return rejectWithValue('Failed to load dashboard layouts');
    }
  }
);

export const saveLayout = createAsyncThunk(
  'dashboard/saveLayout',
  async (layout: Layout, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dashboard: DashboardState };
      const layouts = [...state.dashboard.layouts];
      
      const existingIndex = layouts.findIndex(l => l.id === layout.id);
      if (existingIndex >= 0) {
        layouts[existingIndex] = { ...layout, updatedAt: new Date().toISOString() };
      } else {
        layouts.push({ ...layout, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
      return layouts;
    } catch (error: any) {
      return rejectWithValue('Failed to save layout');
    }
  }
);

// 📊 Dashboard Slice
export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // 🎨 Layout Management
    setActiveLayout: (state, action: PayloadAction<string>) => {
      state.activeLayoutId = action.payload;
      state.layouts.forEach(layout => {
        layout.isActive = layout.id === action.payload;
      });
    },
    
    toggleEditMode: (state) => {
      state.isEditing = !state.isEditing;
    },
    
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    
    // 🧩 Widget Management
    addWidget: (state, action: PayloadAction<Omit<Widget, 'id' | 'lastUpdated'>>) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        const newWidget: Widget = {
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          lastUpdated: new Date().toISOString(),
          ...action.payload,
        };
        activeLayout.widgets.push(newWidget);
        activeLayout.updatedAt = new Date().toISOString();
      }
    },
    
    removeWidget: (state, action: PayloadAction<string>) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        activeLayout.widgets = activeLayout.widgets.filter(w => w.id !== action.payload);
        activeLayout.updatedAt = new Date().toISOString();
      }
    },
    
    updateWidget: (state, action: PayloadAction<{
      widgetId: string;
      updates: Partial<Widget>;
    }>) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        const widget = activeLayout.widgets.find(w => w.id === action.payload.widgetId);
        if (widget) {
          Object.assign(widget, action.payload.updates, {
            lastUpdated: new Date().toISOString(),
          });
          activeLayout.updatedAt = new Date().toISOString();
        }
      }
    },
    
    updateWidgetPosition: (state, action: PayloadAction<{
      widgetId: string;
      position: Widget['position'];
    }>) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        const widget = activeLayout.widgets.find(w => w.id === action.payload.widgetId);
        if (widget) {
          widget.position = action.payload.position;
          widget.lastUpdated = new Date().toISOString();
          activeLayout.updatedAt = new Date().toISOString();
        }
      }
    },
    
    toggleWidgetVisibility: (state, action: PayloadAction<string>) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        const widget = activeLayout.widgets.find(w => w.id === action.payload);
        if (widget) {
          widget.isVisible = !widget.isVisible;
          widget.lastUpdated = new Date().toISOString();
        }
      }
    },
    
    // 📈 Market Data Management
    updateMarketData: (state, action: PayloadAction<{ [symbol: string]: MarketData }>) => {
      state.marketData = { ...state.marketData, ...action.payload };
      state.performance.lastUpdateTime = new Date().toISOString();
      
      // Update data age tracking
      Object.keys(action.payload).forEach(symbol => {
        state.performance.dataAge[symbol] = Date.now();
      });
    },
    
    updatePortfolioData: (state, action: PayloadAction<DashboardState['portfolioData']>) => {
      state.portfolioData = action.payload;
    },
    
    // ⚙️ Preferences Management
    updatePreferences: (state, action: PayloadAction<Partial<DashboardPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 🧹 Cleanup Actions
    clearErrors: (state) => {
      state.errors = {};
    },
    
    clearError: (state, action: PayloadAction<keyof DashboardState['errors']>) => {
      delete state.errors[action.payload];
    },
    
    // 📊 Performance Tracking
    updatePerformanceMetrics: (state, action: PayloadAction<{
      updateFrequency?: number;
      dataAge?: { [key: string]: number };
    }>) => {
      state.performance = {
        ...state.performance,
        ...action.payload,
        lastUpdateTime: new Date().toISOString(),
      };
    },
  },
  
  extraReducers: (builder) => {
    // Load Layouts
    builder
      .addCase(loadDashboardLayouts.pending, (state) => {
        state.loading.layouts = true;
        delete state.errors.layouts;
      })
      .addCase(loadDashboardLayouts.fulfilled, (state, action) => {
        state.loading.layouts = false;
        state.layouts = action.payload;
        
        // Set active layout
        const activeLayout = action.payload.find((l: Layout) => l.isActive) || action.payload[0];
        if (activeLayout) {
          state.activeLayoutId = activeLayout.id;
        }
      })
      .addCase(loadDashboardLayouts.rejected, (state, action) => {
        state.loading.layouts = false;
        state.errors.layouts = action.payload as string;
      });
    
    // Save Layout
    builder
      .addCase(saveLayout.fulfilled, (state, action) => {
        state.layouts = action.payload;
      })
      .addCase(saveLayout.rejected, (state, action) => {
        state.errors.layouts = action.payload as string;
      });
  },
});

// 🎯 Action Creators Export
export const {
  setActiveLayout,
  toggleEditMode,
  setEditMode,
  addWidget,
  removeWidget,
  updateWidget,
  updateWidgetPosition,
  toggleWidgetVisibility,
  updateMarketData,
  updatePortfolioData,
  updatePreferences,
  clearErrors,
  clearError,
  updatePerformanceMetrics,
} = dashboardSlice.actions;

// 🔍 Selectors
export const selectDashboard = (state: { dashboard: DashboardState }) => state.dashboard;
export const selectLayouts = (state: { dashboard: DashboardState }) => state.dashboard.layouts;
export const selectActiveLayout = (state: { dashboard: DashboardState }) => 
  state.dashboard.layouts.find(l => l.id === state.dashboard.activeLayoutId);
export const selectIsEditing = (state: { dashboard: DashboardState }) => state.dashboard.isEditing;
export const selectAvailableWidgets = (state: { dashboard: DashboardState }) => state.dashboard.availableWidgets;
export const selectMarketData = (state: { dashboard: DashboardState }) => state.dashboard.marketData;
export const selectPortfolioData = (state: { dashboard: DashboardState }) => state.dashboard.portfolioData;
export const selectDashboardPreferences = (state: { dashboard: DashboardState }) => state.dashboard.preferences;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;
export const selectDashboardErrors = (state: { dashboard: DashboardState }) => state.dashboard.errors;
export const selectPerformanceMetrics = (state: { dashboard: DashboardState }) => state.dashboard.performance;

// Helper selectors
export const selectWidgetById = (widgetId: string) => (state: { dashboard: DashboardState }) => {
  const activeLayout = selectActiveLayout(state);
  return activeLayout?.widgets.find(w => w.id === widgetId);
};

export const selectWidgetsByType = (type: Widget['type']) => (state: { dashboard: DashboardState }) => {
  const activeLayout = selectActiveLayout(state);
  return activeLayout?.widgets.filter(w => w.type === type) || [];
};

export default dashboardSlice.reducer;
