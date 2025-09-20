// Enhanced Store Hooks
// TypeScript hooks for the enhanced state management system
// Progressive enhancement with feature flag support

import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { EnhancedRootState, EnhancedAppDispatch } from './store';
import { FEATURE_FLAGS } from '../../config/features';

// Enhanced typed hooks
export const useEnhancedAppDispatch = (): EnhancedAppDispatch => useDispatch<EnhancedAppDispatch>();
export const useEnhancedAppSelector: TypedUseSelectorHook<EnhancedRootState> = useSelector;

// Feature-flag aware hooks that fall back to legacy implementation
export const useEnhancedTradingPreferences = () => {
  // Always call hooks first
  const dispatch = useEnhancedAppDispatch();
  const tradingState = useEnhancedAppSelector(state => state.enhancedTradingPreferences);

  // If enhanced features are disabled, return null or legacy data
  if (!FEATURE_FLAGS.useEnhancedStateManagement) {
    return {
      preferences: null,
      isLoading: false,
      error: null,
      actions: {},
    };
  }
  
  return {
    preferences: tradingState.preferences,
    isLoading: tradingState.isLoading,
    error: tradingState.error,
    lastUpdated: tradingState.lastUpdated,
    actions: {
      updateDefaultCurrency: (currency: string) => 
        dispatch({ type: 'enhancedTradingPreferences/updateDefaultCurrency', payload: currency }),
      updateRiskManagement: (risk: any) => 
        dispatch({ type: 'enhancedTradingPreferences/updateRiskManagement', payload: risk }),
      updateOrderDefaults: (defaults: any) => 
        dispatch({ type: 'enhancedTradingPreferences/updateOrderDefaults', payload: defaults }),
      updateAlertPreferences: (alerts: any) => 
        dispatch({ type: 'enhancedTradingPreferences/updateAlertPreferences', payload: alerts }),
      resetPreferences: () => 
        dispatch({ type: 'enhancedTradingPreferences/resetTradingPreferences' }),
    },
  };
};

export const useEnhancedDisplayPreferences = () => {
  // Always call hooks first
  const dispatch = useEnhancedAppDispatch();
  const displayState = useEnhancedAppSelector(state => state.enhancedDisplayPreferences);

  // If enhanced features are disabled, return null or legacy data
  if (!FEATURE_FLAGS.useEnhancedStateManagement) {
    return {
      preferences: null,
      isLoading: false,
      error: null,
      actions: {},
    };
  }
  
  return {
    preferences: displayState.preferences,
    isLoading: displayState.isLoading,
    error: displayState.error,
    lastUpdated: displayState.lastUpdated,
    actions: {
      updateTheme: (theme: 'light' | 'dark' | 'auto') => 
        dispatch({ type: 'enhancedDisplayPreferences/updateTheme', payload: theme }),
      updateLanguage: (language: string) => 
        dispatch({ type: 'enhancedDisplayPreferences/updateLanguage', payload: language }),
      updateChartPreferences: (charts: any) => 
        dispatch({ type: 'enhancedDisplayPreferences/updateChartPreferences', payload: charts }),
      updateLayoutPreferences: (layout: any) => 
        dispatch({ type: 'enhancedDisplayPreferences/updateLayoutPreferences', payload: layout }),
      toggleCompactMode: () => 
        dispatch({ type: 'enhancedDisplayPreferences/toggleCompactMode' }),
      toggleAnimations: () => 
        dispatch({ type: 'enhancedDisplayPreferences/toggleAnimations' }),
      resetPreferences: () => 
        dispatch({ type: 'enhancedDisplayPreferences/resetDisplayPreferences' }),
    },
  };
};

// Convenience hook for theme management
export const useEnhancedTheme = () => {
  const { preferences, actions } = useEnhancedDisplayPreferences();
  
  return {
    theme: preferences?.theme || 'auto',
    setTheme: actions.updateTheme,
    isLoading: false,
  };
};

// Convenience hook for trading settings
export const useEnhancedRiskManagement = () => {
  const { preferences, actions } = useEnhancedTradingPreferences();
  
  return {
    riskSettings: preferences?.riskManagement || {},
    updateRiskSettings: actions.updateRiskManagement,
    isLoading: false,
  };
};

// Progressive enhancement utility hook
export const useEnhancedFeatures = () => {
  return {
    isEnhancedStateEnabled: FEATURE_FLAGS.useEnhancedStateManagement,
    isEnhancedComponentsEnabled: FEATURE_FLAGS.useEnhancedComponents,
    isDesignSystemEnabled: FEATURE_FLAGS.useDesignSystem,
    enhancedStoreAvailable: true, // Since we're building it
  };
};
