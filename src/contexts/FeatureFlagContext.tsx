import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flag configuration
const FEATURE_FLAGS = {
  // Hub activation flags
  CONTENT_HUB_ENABLED: 'contentHubEnabled',
  CONTACT_HUB_ENABLED: 'contactHubEnabled',
  CAMPAIGN_HUB_ENABLED: 'campaignHubEnabled',
  DEMAND_HUB_ENABLED: 'demandHubEnabled',
  SHIPPING_HUB_ENABLED: 'shippingHubEnabled',
  SERVICE_HUB_ENABLED: 'serviceHubEnabled',

  // Feature enhancement flags
  ENHANCED_CONTENT_GALLERY: 'enhancedContentGallery',
  SMART_EMAIL_COMPOSER: 'smartEmailComposer',
  CAMPAIGN_ANALYTICS: 'campaignAnalytics',
  CROSS_HUB_SEARCH: 'crossHubSearch',
  ADVANCED_AUTOMATION: 'advancedAutomation',

  // Experimental features
  AI_CONTENT_ANALYSIS: 'aiContentAnalysis',
  PREDICTIVE_LEAD_SCORING: 'predictiveLeadScoring',
  REAL_TIME_COLLABORATION: 'realTimeCollaboration',
};

// Default feature flag values
const DEFAULT_FLAGS: Record<string, boolean> = {
  [FEATURE_FLAGS.CONTENT_HUB_ENABLED]: true, // Always enabled for backward compatibility
  [FEATURE_FLAGS.CONTACT_HUB_ENABLED]: false,
  [FEATURE_FLAGS.CAMPAIGN_HUB_ENABLED]: true, // EmailBlaster is core functionality
  [FEATURE_FLAGS.DEMAND_HUB_ENABLED]: false,
  [FEATURE_FLAGS.SHIPPING_HUB_ENABLED]: false,
  [FEATURE_FLAGS.SERVICE_HUB_ENABLED]: false,

  [FEATURE_FLAGS.ENHANCED_CONTENT_GALLERY]: false,
  [FEATURE_FLAGS.SMART_EMAIL_COMPOSER]: false,
  [FEATURE_FLAGS.CAMPAIGN_ANALYTICS]: false,
  [FEATURE_FLAGS.CROSS_HUB_SEARCH]: false,
  [FEATURE_FLAGS.ADVANCED_AUTOMATION]: false,

  [FEATURE_FLAGS.AI_CONTENT_ANALYSIS]: false,
  [FEATURE_FLAGS.PREDICTIVE_LEAD_SCORING]: false,
  [FEATURE_FLAGS.REAL_TIME_COLLABORATION]: false,
};

// Feature flag context type
interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  loading: boolean;
  isEnabled: (flagKey: string) => boolean;
  updateFlag: (flagKey: string, value: boolean) => void;
  getAllFlags: () => Record<string, boolean>;
  resetToDefaults: () => void;
}

// Feature flag context
const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// Feature flag provider props
interface FeatureFlagProviderProps {
  children: ReactNode;
}

// Feature flag provider component
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Load feature flags from various sources
  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // Load from localStorage (user preferences)
        const storedFlags = localStorage.getItem('featureFlags');
        if (storedFlags) {
          const parsedFlags = JSON.parse(storedFlags);
          setFlags(prevFlags => ({ ...prevFlags, ...parsedFlags }));
        }

        // Load from environment variables (deployment config)
        const envFlags = {};
        Object.keys(FEATURE_FLAGS).forEach(key => {
          const envVar = `REACT_APP_${FEATURE_FLAGS[key].toUpperCase()}`;
          if (process.env[envVar]) {
            envFlags[FEATURE_FLAGS[key]] = process.env[envVar] === 'true';
          }
        });

        if (Object.keys(envFlags).length > 0) {
          setFlags(prevFlags => ({ ...prevFlags, ...envFlags }));
        }

        // TODO: Load from remote config service
        // const remoteFlags = await configApi.getFeatureFlags();
        // setFlags(prevFlags => ({ ...prevFlags, ...remoteFlags }));

      } catch (error) {
        console.error('Error loading feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  // Update feature flag
  const updateFlag = (flagKey, value) => {
    const newFlags = { ...flags, [flagKey]: value };
    setFlags(newFlags);

    // Persist to localStorage
    localStorage.setItem('featureFlags', JSON.stringify(newFlags));

    // TODO: Persist to remote config service
    // await configApi.updateFeatureFlag(flagKey, value);
  };

  // Check if feature is enabled
  const isEnabled = (flagKey) => {
    return flags[flagKey] === true;
  };

  // Get all flags
  const getAllFlags = () => {
    return { ...flags };
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setFlags(DEFAULT_FLAGS);
    localStorage.removeItem('featureFlags');
  };

  const value = {
    flags,
    loading,
    isEnabled,
    updateFlag,
    getAllFlags,
    resetToDefaults,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Custom hook to use feature flags
export const useFeatureFlag = (flagKey: string) => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }

  return {
    isEnabled: context.isEnabled(flagKey),
    updateFlag: (value: boolean) => context.updateFlag(flagKey, value),
  };
};

// Hook to get all feature flags
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  return context;
};

// Feature flag constants export
export { FEATURE_FLAGS };

// Higher-order component for conditional rendering
export const withFeatureFlag = (flagKey) => (WrappedComponent) => {
  return (props) => {
    const { isEnabled } = useFeatureFlag(flagKey);

    if (!isEnabled) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

// Component for feature flag controlled rendering
export const FeatureFlagged = ({ flag, children, fallback = null }) => {
  const { isEnabled } = useFeatureFlag(flag);
  return isEnabled ? children : fallback;
};