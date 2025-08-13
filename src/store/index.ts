// 🏗️ Professional Redux Store Architecture
// Modular, Reusable, Scalable State Management

import { configureStore, createSlice } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';

// 🔐 Simple Auth Slice for Demo
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

// 🎨 Simple UI Slice for Demo
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebar: {
      isOpen: true,
      isMobile: false,
      activeSection: 'dashboard',
      pinnedItems: [],
    },
    theme: {
      mode: 'light',
      primaryColor: '#007bff',
      fontSize: 'md',
      animations: true,
    },
    notifications: [],
    modals: {},
    loading: {
      global: false,
      components: {},
    },
    search: {
      query: '',
      isSearching: false,
      results: [],
      filters: {},
    },
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1200,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
      isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.isOpen = action.payload;
    },
    setActiveSection: (state, action) => {
      state.sidebar.activeSection = action.payload;
    },
    pinSidebarItem: (state, action) => {
      if (!state.sidebar.pinnedItems.includes(action.payload)) {
        state.sidebar.pinnedItems.push(action.payload);
      }
    },
    unpinSidebarItem: (state, action) => {
      state.sidebar.pinnedItems = state.sidebar.pinnedItems.filter(
        item => item !== action.payload
      );
    },
    setThemeMode: (state, action) => {
      state.theme.mode = action.payload;
    },
    setPrimaryColor: (state, action) => {
      state.theme.primaryColor = action.payload;
    },
    setFontSize: (state, action) => {
      state.theme.fontSize = action.payload;
    },
    toggleAnimations: (state) => {
      state.theme.animations = !state.theme.animations;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        autoClose: true,
        duration: 5000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      const { id, data, size = 'md' } = action.payload;
      state.modals[id] = { isOpen: true, data, size };
    },
    closeModal: (state, action) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].isOpen = false;
      });
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.components[component] = loading;
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    setSearching: (state, action) => {
      state.search.isSearching = action.payload;
    },
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    setSearchFilter: (state, action) => {
      const { key, value } = action.payload;
      state.search.filters[key] = value;
    },
    clearSearchFilters: (state) => {
      state.search.filters = {};
    },
    updateViewport: (state, action) => {
      const { width, height } = action.payload;
      state.viewport.width = width;
      state.viewport.height = height;
      state.viewport.isMobile = width < 768;
      state.viewport.isTablet = width >= 768 && width < 1024;
      state.viewport.isDesktop = width >= 1024;
    },
  },
});

// 📊 Simple Dashboard Slice for Demo
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    layouts: [
      {
        id: 'default',
        name: 'Default Layout',
        widgets: ['portfolio', 'watchlist', 'news'],
        isDefault: true,
      }
    ],
    activeLayoutId: 'default',
    isEditing: false,
    availableWidgets: [
      { id: 'portfolio', name: 'Portfolio Summary', type: 'chart' },
      { id: 'watchlist', name: 'Watchlist', type: 'table' },
      { id: 'news', name: 'Market News', type: 'feed' },
    ],
    loading: {
      layout: false,
      data: false,
    },
  },
  reducers: {
    setActiveLayout: (state, action) => {
      state.activeLayoutId = action.payload;
    },
    toggleEditMode: (state) => {
      state.isEditing = !state.isEditing;
    },
    addWidget: (state, action) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout && !activeLayout.widgets.includes(action.payload)) {
        activeLayout.widgets.push(action.payload);
      }
    },
    removeWidget: (state, action) => {
      const activeLayout = state.layouts.find(l => l.id === state.activeLayoutId);
      if (activeLayout) {
        activeLayout.widgets = activeLayout.widgets.filter(w => w !== action.payload);
      }
    },
  },
});

// ⚙️ Simple Preferences Slice for Demo
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
    },
    trading: {
      defaultOrderType: 'market',
      confirmOrders: true,
    },
    workspace: {
      favoriteInstruments: ['AAPL', 'GOOGL', 'TSLA'],
    },
    loading: false,
    errors: {},
    isModified: false,
    lastSyncTime: null,
  },
  reducers: {
    updateDisplayPreferences: (state, action) => {
      Object.assign(state.display, action.payload);
      state.isModified = true;
    },
    updateTradingPreferences: (state, action) => {
      Object.assign(state.trading, action.payload);
      state.isModified = true;
    },
    addFavoriteInstrument: (state, action) => {
      if (!state.workspace.favoriteInstruments.includes(action.payload)) {
        state.workspace.favoriteInstruments.push(action.payload);
        state.isModified = true;
      }
    },
    removeFavoriteInstrument: (state, action) => {
      state.workspace.favoriteInstruments = state.workspace.favoriteInstruments.filter(
        instrument => instrument !== action.payload
      );
      state.isModified = true;
    },
    setTheme: (state, action) => {
      state.display.theme = action.payload;
      state.isModified = true;
    },
    savePreferences: (state) => {
      state.isModified = false;
      state.lastSyncTime = new Date().toISOString();
    },
  },
});

// Export actions for use in components
export const authActions = authSlice.actions;
export const uiActions = uiSlice.actions;
export const dashboardActions = dashboardSlice.actions;
export const preferencesActions = preferencesSlice.actions;

// 🔧 Store Configuration with Enhanced DevTools
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    dashboard: dashboardSlice.reducer,
    preferences: preferencesSlice.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable data
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.sessionExpiry'],
      },
    }),
    
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Tamyla Trading Portal',
    trace: true,
    traceLimit: 25,
  },
});

// 📝 TypeScript Support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 🔄 Store Persistence Configuration
export const persistConfig = {
  key: 'tamyla-trading-portal',
  version: 1,
  storage,
  whitelist: ['auth', 'preferences', 'dashboard'], // Only persist specific slices
  blacklist: ['ui'], // Don't persist UI state
};

export default store;
