import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

export const BrevoContext = createContext();

export const BrevoProvider = ({ children, websiteId }) => {
  const { user } = useAuth();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    websiteId,
    user
  }), [websiteId, user]);

  return (
    <BrevoContext.Provider value={contextValue}>
      {children}
    </BrevoContext.Provider>
  );
};

export const useBrevo = () => {
  const context = useContext(BrevoContext);
  if (!context) {
    throw new Error('useBrevo must be used within a BrevoProvider');
  }
  return context;
};
