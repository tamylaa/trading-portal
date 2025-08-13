// 🌉 Auth Bridge - Smooth Transition from Context to Redux
// Maintains compatibility while adding Redux functionality

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useAuth as useReduxAuth } from '../../store/hooks';

// Types for existing AuthContext compatibility
interface LegacyAuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// 🔄 Auth Bridge Hook - Provides both old and new functionality
export const useAuthBridge = (): LegacyAuthContextType & {
  // Extended Redux features
  enhanced: ReturnType<typeof useReduxAuth>;
} => {
  const dispatch = useAppDispatch();
  const reduxAuth = useReduxAuth();
  
  // Sync with legacy patterns while providing Redux enhancements
  const bridgeAuth: LegacyAuthContextType = {
    user: reduxAuth.user,
    token: reduxAuth.token,
    isAuthenticated: reduxAuth.isAuthenticated,
    loading: reduxAuth.loading,
    error: reduxAuth.error,
    
    // Legacy methods with Redux implementation
    login: async (email: string) => {
      try {
        dispatch({ type: 'auth/requestMagicLink', payload: { email } });
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    
    logout: () => {
      dispatch({ type: 'auth/logout' });
    },
    
    checkAuth: async () => {
      dispatch({ type: 'auth/checkAuthStatus' });
    },
  };
  
  return {
    ...bridgeAuth,
    enhanced: reduxAuth, // Access to all Redux features
  };
};

// 🎯 Legacy Hook for Drop-in Replacement
export const useAuth = (): LegacyAuthContextType => {
  const { enhanced, ...legacyAuth } = useAuthBridge();
  return legacyAuth;
};

// 🔄 Context Bridge Component (optional for gradual migration)
const AuthContext = React.createContext<LegacyAuthContextType | null>(null);

export const AuthBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Legacy context hook for existing components
export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthBridgeProvider');
  }
  return context;
};
