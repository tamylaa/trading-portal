// Feature flags system for safe gradual migration
// This allows opt-in to enhanced features without breaking existing functionality

export interface FeatureFlags {
  // Component enhancements
  useEnhancedComponents: boolean;
  useEnhancedEmailBlaster: boolean;
  useEnhancedDashboard: boolean;
  
  // State management enhancements
  useEnhancedState: boolean;
  useEnhancedStateManagement: boolean;
  useComposedPreferences: boolean;
  useModularDashboardState: boolean;
  
  // Styling enhancements  
  useDesignSystem: boolean;
  useCSSModules: boolean;
  useEnhancedThemes: boolean;
  
  // API enhancements
  useEnhancedServices: boolean;
  useTypedAPI: boolean;
  useRealTimeData: boolean;
  useOptimisticUpdates: boolean;
  
  // Development features
  enableDevTools: boolean;
  enablePerformanceMonitoring: boolean;
}

// Default to false for all enhancements - existing functionality preserved
export const FEATURE_FLAGS: FeatureFlags = {
  // Component enhancements - start disabled
  useEnhancedComponents: false,
  useEnhancedEmailBlaster: false,
  useEnhancedDashboard: false,
  
  // State management enhancements - start disabled
  useEnhancedState: false,
  useEnhancedStateManagement: false,
  useComposedPreferences: false,
  useModularDashboardState: false,
  
  // Styling enhancements - start disabled
  useDesignSystem: false,
  useCSSModules: false,
  useEnhancedThemes: false,
  
  // API enhancements - start disabled
  useEnhancedServices: false,
  useTypedAPI: false,
  useRealTimeData: false,
  useOptimisticUpdates: false,
  
  // Development features - can be enabled safely
  enableDevTools: process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring: false
};

// Utility functions for feature flag checking
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[feature];
};

// Gradual rollout helper - enables features for specific components
export const getComponentFeatures = (componentName: string) => ({
  useEnhanced: FEATURE_FLAGS.useEnhancedComponents,
  useDesignSystem: FEATURE_FLAGS.useDesignSystem,
  useCSSModules: FEATURE_FLAGS.useCSSModules,
  // Component-specific overrides can be added here
  ...(componentName === 'EmailBlaster' && { useEnhanced: FEATURE_FLAGS.useEnhancedEmailBlaster }),
  ...(componentName === 'Dashboard' && { useEnhanced: FEATURE_FLAGS.useEnhancedDashboard })
});

// Environment-based feature enablement
export const enableFeaturesForEnvironment = (env: 'development' | 'staging' | 'production') => {
  switch (env) {
    case 'development':
      // Safe to enable all features in development
      return {
        ...FEATURE_FLAGS,
        enableDevTools: true,
        enablePerformanceMonitoring: true,
        // Optionally enable some safe enhancements in dev
        useDesignSystem: true
      };
      
    case 'staging':
      // Gradually test features in staging
      return {
        ...FEATURE_FLAGS,
        useDesignSystem: true,
        enablePerformanceMonitoring: true
      };
      
    case 'production':
      // Keep production conservative - only enable proven features
      return FEATURE_FLAGS;
      
    default:
      return FEATURE_FLAGS;
  }
};

// Runtime feature toggle (for A/B testing or gradual rollouts)
export const setFeatureFlag = (feature: keyof FeatureFlags, enabled: boolean) => {
  FEATURE_FLAGS[feature] = enabled;
  
  // Log feature changes in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎛️ Feature flag '${feature}' ${enabled ? 'enabled' : 'disabled'}`);
  }
};
