// TypeScript wrapper for AuthContext.js
// This provides proper TypeScript exports for the JavaScript AuthContext module

// Import the entire JavaScript module
import * as AuthContextJS from './AuthContext.js';

// Re-export with proper typing
export const useAuth = (AuthContextJS as any).useAuth;
export const AuthProvider = (AuthContextJS as any).AuthProvider;

// Export types for TypeScript consumers
export type { AuthContextType, User } from './AuthContext.types';
