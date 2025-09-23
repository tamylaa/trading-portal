// 🔗 Enhanced Redux Hooks - Type-safe, Optimized
// Seamless integration with existing components

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { useEffect, useCallback } from 'react';
import type { RootState, AppDispatch } from './index';
import { syncWithUITheme } from './slices/themeSlice';

// 📝 Typed Hooks for Better Developer Experience
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 🔐 Enhanced Auth Hooks - Replacing your existing AuthContext
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    // Core auth state
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    
    // Auth actions
    login: useCallback((credentials: any) => {
      dispatch({ type: 'auth/loginStart' });
      // Simulate async login
      setTimeout(() => {
        dispatch({ 
          type: 'auth/loginSuccess', 
          payload: { 
            user: { email: credentials.email, name: 'Demo User' }, 
            token: 'demo-token' 
          } 
        });
      }, 1000);
    }, [dispatch]),
    
    logout: useCallback(() => {
      dispatch({ type: 'auth/logout' });
    }, [dispatch]),
  };
};

// 🎨 Enhanced UI Hooks - Replacing your existing SidebarContext
export const useSidebar = () => {
  const sidebar = useAppSelector(state => state.ui.sidebar);
  const viewport = useAppSelector(state => state.ui.viewport);
  const dispatch = useAppDispatch();
  
  return {
    // Core sidebar state
    isOpen: sidebar.isOpen,
    isMobile: sidebar.isMobile,
    activeSection: sidebar.activeSection,
    pinnedItems: sidebar.pinnedItems,
    
    // Enhanced features
    toggleSidebar: useCallback(() => {
      dispatch({ type: 'ui/toggleSidebar' });
    }, [dispatch]),
    
    setSidebarOpen: useCallback((open: boolean) => {
      dispatch({ type: 'ui/setSidebarOpen', payload: open });
    }, [dispatch]),
    
    setActiveSection: useCallback((section: string) => {
      dispatch({ type: 'ui/setActiveSection', payload: section });
    }, [dispatch]),
    
    pinItem: useCallback((item: string) => {
      dispatch({ type: 'ui/pinSidebarItem', payload: item });
    }, [dispatch]),
    
    unpinItem: useCallback((item: string) => {
      dispatch({ type: 'ui/unpinSidebarItem', payload: item });
    }, [dispatch]),
    
    // Responsive information
    viewport: viewport,
  };
};

// 🔔 Notification System Hook
export const useNotifications = () => {
  const notifications = useAppSelector(state => state.ui.notifications);
  const dispatch = useAppDispatch();
  
  return {
    notifications,
    
    addNotification: useCallback((notification: {
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      autoClose?: boolean;
      duration?: number;
    }) => {
      dispatch({ type: 'ui/addNotification', payload: notification });
    }, [dispatch]),
    
    removeNotification: useCallback((id: string) => {
      dispatch({ type: 'ui/removeNotification', payload: id });
    }, [dispatch]),
    
    clearAll: useCallback(() => {
      dispatch({ type: 'ui/clearNotifications' });
    }, [dispatch]),
    
    // Convenience methods for common notification types
    success: useCallback((title: string, message: string) => {
      dispatch({ 
        type: 'ui/addNotification', 
        payload: { type: 'success', title, message } 
      });
    }, [dispatch]),
    
    error: useCallback((title: string, message: string) => {
      dispatch({ 
        type: 'ui/addNotification', 
        payload: { type: 'error', title, message, autoClose: false } 
      });
    }, [dispatch]),
    
    warning: useCallback((title: string, message: string) => {
      dispatch({ 
        type: 'ui/addNotification', 
        payload: { type: 'warning', title, message } 
      });
    }, [dispatch]),
    
    info: useCallback((title: string, message: string) => {
      dispatch({ 
        type: 'ui/addNotification', 
        payload: { type: 'info', title, message } 
      });
    }, [dispatch]),
  };
};

// 🎨 Theme Hook
export const useTheme = () => {
  const theme = useAppSelector(state => state.ui.theme);
  const displayPrefs = useAppSelector(state => state.preferences.display);
  const dispatch = useAppDispatch();
  
  // 🔄 Sync theme slice with ui.theme changes
  useEffect(() => {
    dispatch(syncWithUITheme(theme));
  }, [theme, dispatch]);
  
  return {
    // Current theme state
    mode: theme.mode,
    primaryColor: theme.primaryColor,
    fontSize: theme.fontSize,
    animations: theme.animations,
    
    // From user preferences
    language: displayPrefs.language,
    timezone: displayPrefs.timezone,
    
    // Theme actions
    setMode: useCallback((mode: 'light' | 'dark' | 'auto') => {
      dispatch({ type: 'ui/setThemeMode', payload: mode });
      dispatch({ type: 'theme/setThemeMode', payload: mode });
      dispatch({ type: 'preferences/setTheme', payload: mode });
    }, [dispatch]),
    
    setPrimaryColor: useCallback((color: string) => {
      dispatch({ type: 'ui/setPrimaryColor', payload: color });
      dispatch({ type: 'theme/setPrimaryColor', payload: color });
    }, [dispatch]),
    
    setFontSize: useCallback((size: 'sm' | 'md' | 'lg') => {
      dispatch({ type: 'ui/setFontSize', payload: size });
      dispatch({ type: 'theme/setFontSize', payload: size });
    }, [dispatch]),
    
    toggleAnimations: useCallback(() => {
      dispatch({ type: 'ui/toggleAnimations' });
    }, [dispatch]),
  };
};

// 📊 Dashboard Hook
export const useDashboard = () => {
  const dashboard = useAppSelector(state => state.dashboard);
  const dispatch = useAppDispatch();
  
  return {
    // Layout state
    layouts: dashboard.layouts,
    activeLayout: dashboard.layouts.find(l => l.id === dashboard.activeLayoutId),
    isEditing: dashboard.isEditing,
    
    // Widget state
    availableWidgets: dashboard.availableWidgets,
    
    // Loading states
    loading: dashboard.loading,
    
    // Actions
    setActiveLayout: useCallback((layoutId: string) => {
      dispatch({ type: 'dashboard/setActiveLayout', payload: layoutId });
    }, [dispatch]),
    
    toggleEditMode: useCallback(() => {
      dispatch({ type: 'dashboard/toggleEditMode' });
    }, [dispatch]),
    
    addWidget: useCallback((widgetId: string) => {
      dispatch({ type: 'dashboard/addWidget', payload: widgetId });
    }, [dispatch]),
    
    removeWidget: useCallback((widgetId: string) => {
      dispatch({ type: 'dashboard/removeWidget', payload: widgetId });
    }, [dispatch]),
  };
};

// 🔍 Search Hook
export const useSearch = () => {
  const search = useAppSelector(state => state.ui.search);
  const dispatch = useAppDispatch();
  
  return {
    query: search.query,
    filters: search.filters,
    results: search.results,
    isSearching: search.isSearching,
    
    setQuery: useCallback((query: string) => {
      dispatch({ type: 'ui/setSearchQuery', payload: query });
    }, [dispatch]),
    
    setFilter: useCallback((key: string, value: any) => {
      dispatch({ type: 'ui/setSearchFilter', payload: { key, value } });
    }, [dispatch]),
    
    clearFilters: useCallback(() => {
      dispatch({ type: 'ui/clearSearchFilters' });
    }, [dispatch]),
    
    setResults: useCallback((results: any[]) => {
      dispatch({ type: 'ui/setSearchResults', payload: results });
    }, [dispatch]),
    
    setSearching: useCallback((searching: boolean) => {
      dispatch({ type: 'ui/setSearching', payload: searching });
    }, [dispatch]),
  };
};

// 🏢 Preferences Hook
export const usePreferences = () => {
  const preferences = useAppSelector(state => state.preferences);
  const dispatch = useAppDispatch();
  
  return {
    // All preference categories
    trading: preferences.trading,
    display: preferences.display,
    workspace: preferences.workspace,
    
    // State management
    loading: preferences.loading,
    errors: preferences.errors,
    isModified: preferences.isModified,
    lastSyncTime: preferences.lastSyncTime,
    
    // Quick access to common preferences
    theme: preferences.display.theme,
    language: preferences.display.language,
    timezone: preferences.display.timezone,
    favoriteInstruments: preferences.workspace.favoriteInstruments,
    
    // Actions
    updateTradingPrefs: useCallback((updates: any) => {
      dispatch({ type: 'preferences/updateTradingPreferences', payload: updates });
    }, [dispatch]),
    
    updateDisplayPrefs: useCallback((updates: any) => {
      dispatch({ type: 'preferences/updateDisplayPreferences', payload: updates });
    }, [dispatch]),
    
    addFavorite: useCallback((instrument: string) => {
      dispatch({ type: 'preferences/addFavoriteInstrument', payload: instrument });
    }, [dispatch]),
    
    removeFavorite: useCallback((instrument: string) => {
      dispatch({ type: 'preferences/removeFavoriteInstrument', payload: instrument });
    }, [dispatch]),
    
    save: useCallback(() => {
      dispatch({ type: 'preferences/savePreferences' });
    }, [dispatch]),
  };
};

// 📱 Responsive Hook
export const useResponsive = () => {
  const viewport = useAppSelector(state => state.ui.viewport);
  const dispatch = useAppDispatch();
  
  // Auto-update viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      dispatch({
        type: 'ui/updateViewport',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);
  
  return {
    viewport,
    isMobile: viewport.isMobile,
    isTablet: viewport.isTablet,
    isDesktop: viewport.isDesktop,
    width: viewport.width,
    height: viewport.height,
  };
};

// 🔄 Loading Hook - Global and Component-specific
export const useLoading = () => {
  const loading = useAppSelector(state => state.ui.loading);
  const dispatch = useAppDispatch();
  
  return {
    global: loading.global,
    components: loading.components,
    
    setGlobal: useCallback((isLoading: boolean) => {
      dispatch({ type: 'ui/setGlobalLoading', payload: isLoading });
    }, [dispatch]),
    
    setComponent: useCallback((component: string, isLoading: boolean) => {
      dispatch({ 
        type: 'ui/setComponentLoading', 
        payload: { component, loading: isLoading } 
      });
    }, [dispatch]),
    
    // Helper to check if any component is loading
    isAnyLoading: loading.global || Object.values(loading.components).some(Boolean),
  };
};

// 🖼️ Modal Hook
export const useModal = () => {
  const modals = useAppSelector(state => state.ui.modals);
  const dispatch = useAppDispatch();
  
  return {
    modals,
    
    open: useCallback((id: string, data?: any, size?: 'sm' | 'md' | 'lg' | 'xl') => {
      dispatch({ type: 'ui/openModal', payload: { id, data, size } });
    }, [dispatch]),
    
    close: useCallback((id: string) => {
      dispatch({ type: 'ui/closeModal', payload: id });
    }, [dispatch]),
    
    closeAll: useCallback(() => {
      dispatch({ type: 'ui/closeAllModals' });
    }, [dispatch]),
    
    isOpen: useCallback((id: string) => {
      return modals[id]?.isOpen || false;
    }, [modals]),
    
    getData: useCallback((id: string) => {
      return modals[id]?.data;
    }, [modals]),
  };
};
