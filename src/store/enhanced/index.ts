// Enhanced Store Module Index
// Progressive enhancement store architecture
// Export all enhanced store functionality

// Store configuration
export { configureEnhancedStore, isEnhancedStoreEnabled, migrateToEnhancedStore } from './store';
export type { EnhancedRootState, EnhancedStore, EnhancedAppDispatch } from './store';

// Enhanced hooks
export {
  useEnhancedAppDispatch,
  useEnhancedAppSelector,
  useEnhancedTradingPreferences,
  useEnhancedDisplayPreferences,
  useEnhancedTheme,
  useEnhancedRiskManagement,
  useEnhancedFeatures,
} from './hooks';

// Trading preferences slice
export {
  enhancedTradingPreferencesSlice,
  saveTradingPreferences,
  loadTradingPreferences,
  updateDefaultCurrency,
  updateRiskManagement,
  updateOrderDefaults,
  updateAlertPreferences,
  updateTradingPreferences,
  resetTradingPreferences,
  clearTradingPreferencesError,
  selectTradingPreferences,
  selectTradingPreferencesLoading,
  selectTradingPreferencesError,
  selectDefaultCurrency,
  selectRiskManagement,
  selectOrderDefaults,
  selectTradingAlerts,
} from './slices/tradingPreferencesSlice';

export type { TradingPreferences, TradingPreferencesState } from './slices/tradingPreferencesSlice';

// Display preferences slice
export {
  enhancedDisplayPreferencesSlice,
  saveDisplayPreferences,
  loadDisplayPreferences,
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
  selectDisplayPreferences,
  selectDisplayPreferencesLoading,
  selectDisplayPreferencesError,
  selectTheme,
  selectLanguage,
  selectChartPreferences,
  selectLayoutPreferences,
  selectNumberFormat,
} from './slices/displayPreferencesSlice';

export type { DisplayPreferences, DisplayPreferencesState } from './slices/displayPreferencesSlice';
