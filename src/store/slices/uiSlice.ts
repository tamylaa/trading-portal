// 🎨 UI State Slice - Fluid, Responsive User Interface
// Empowering users with seamless interactions

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 📝 TypeScript Interfaces for UI State
export interface UIState {
  // Layout and Navigation
  sidebar: {
    isOpen: boolean;
    isMobile: boolean;
    activeSection: string;
    pinnedItems: string[];
  };
  
  // Modal and Dialog Management
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
      size?: 'sm' | 'md' | 'lg' | 'xl';
    };
  };
  
  // Loading States for Better UX
  loading: {
    global: boolean;
    components: { [key: string]: boolean };
  };
  
  // Notifications and Alerts
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    autoClose?: boolean;
    duration?: number;
  }>;
  
  // Theme and Appearance
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'sm' | 'md' | 'lg';
    animations: boolean;
  };
  
  // Search and Filters
  search: {
    query: string;
    filters: { [key: string]: any };
    results: any[];
    isSearching: boolean;
  };
  
  // User Experience Enhancements
  tour: {
    isActive: boolean;
    currentStep: number;
    completedSteps: string[];
  };
  
  // Responsive Layout
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
}

// 🎯 Initial State
const initialState: UIState = {
  sidebar: {
    isOpen: true,
    isMobile: false,
    activeSection: 'dashboard',
    pinnedItems: ['dashboard', 'trades'],
  },
  
  modals: {},
  
  loading: {
    global: false,
    components: {},
  },
  
  notifications: [],
  
  theme: {
    mode: 'dark',
    primaryColor: '#4f8cff',
    fontSize: 'md',
    animations: true,
  },
  
  search: {
    query: '',
    filters: {},
    results: [],
    isSearching: false,
  },
  
  tour: {
    isActive: false,
    currentStep: 0,
    completedSteps: [],
  },
  
  viewport: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  },
};

// 🎨 UI Slice - Fluid User Experience
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 📱 Sidebar Management
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.sidebar.activeSection = action.payload;
    },
    
    pinSidebarItem: (state, action: PayloadAction<string>) => {
      if (!state.sidebar.pinnedItems.includes(action.payload)) {
        state.sidebar.pinnedItems.push(action.payload);
      }
    },
    
    unpinSidebarItem: (state, action: PayloadAction<string>) => {
      state.sidebar.pinnedItems = state.sidebar.pinnedItems.filter(
        item => item !== action.payload
      );
    },
    
    // 🖼️ Modal Management
    openModal: (state, action: PayloadAction<{
      id: string;
      data?: any;
      size?: 'sm' | 'md' | 'lg' | 'xl';
    }>) => {
      state.modals[action.payload.id] = {
        isOpen: true,
        data: action.payload.data,
        size: action.payload.size || 'md',
      };
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].isOpen = false;
      });
    },
    
    // ⏳ Loading States
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    setComponentLoading: (state, action: PayloadAction<{
      component: string;
      loading: boolean;
    }>) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },
    
    // 📢 Notifications
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      autoClose?: boolean;
      duration?: number;
    }>) => {
      const notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        autoClose: true,
        duration: 5000,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // 🎨 Theme Management
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme.mode = action.payload;
    },
    
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
    },
    
    setFontSize: (state, action: PayloadAction<'sm' | 'md' | 'lg'>) => {
      state.theme.fontSize = action.payload;
    },
    
    toggleAnimations: (state) => {
      state.theme.animations = !state.theme.animations;
    },
    
    // 🔍 Search Management
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },
    
    setSearchFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      state.search.filters[action.payload.key] = action.payload.value;
    },
    
    clearSearchFilters: (state) => {
      state.search.filters = {};
    },
    
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.search.results = action.payload;
    },
    
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.search.isSearching = action.payload;
    },
    
    // 🎯 Tour Management
    startTour: (state) => {
      state.tour.isActive = true;
      state.tour.currentStep = 0;
    },
    
    nextTourStep: (state) => {
      state.tour.currentStep += 1;
    },
    
    completeTourStep: (state, action: PayloadAction<string>) => {
      if (!state.tour.completedSteps.includes(action.payload)) {
        state.tour.completedSteps.push(action.payload);
      }
    },
    
    endTour: (state) => {
      state.tour.isActive = false;
      state.tour.currentStep = 0;
    },
    
    // 📱 Viewport Management
    updateViewport: (state, action: PayloadAction<{
      width: number;
      height: number;
    }>) => {
      state.viewport.width = action.payload.width;
      state.viewport.height = action.payload.height;
      state.viewport.isMobile = action.payload.width <= 768;
      state.viewport.isTablet = action.payload.width > 768 && action.payload.width <= 1024;
      state.viewport.isDesktop = action.payload.width > 1024;
      
      // Auto-close sidebar on mobile
      if (state.viewport.isMobile && state.sidebar.isOpen) {
        state.sidebar.isOpen = false;
      }
      
      state.sidebar.isMobile = state.viewport.isMobile;
    },
  },
});

// 🎯 Action Creators Export
export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveSection,
  pinSidebarItem,
  unpinSidebarItem,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setComponentLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setThemeMode,
  setPrimaryColor,
  setFontSize,
  toggleAnimations,
  setSearchQuery,
  setSearchFilter,
  clearSearchFilters,
  setSearchResults,
  setSearching,
  startTour,
  nextTourStep,
  completeTourStep,
  endTour,
  updateViewport,
} = uiSlice.actions;

// 🔍 Selectors - Optimized for Performance
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectSidebar = (state: { ui: UIState }) => state.ui.sidebar;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSearch = (state: { ui: UIState }) => state.ui.search;
export const selectTour = (state: { ui: UIState }) => state.ui.tour;
export const selectViewport = (state: { ui: UIState }) => state.ui.viewport;

// Helper selectors for specific modal states
export const selectModalState = (modalId: string) => (state: { ui: UIState }) =>
  state.ui.modals[modalId]?.isOpen || false;

export const selectModalData = (modalId: string) => (state: { ui: UIState }) =>
  state.ui.modals[modalId]?.data;

export default uiSlice.reducer;
