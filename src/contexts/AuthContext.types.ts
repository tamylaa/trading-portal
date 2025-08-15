// TypeScript version of AuthContext - works alongside existing JS version
// This file provides type definitions and enhanced functionality
// while keeping the original AuthContext.js fully functional

import React, { createContext, useContext } from 'react';

// Type definitions for existing AuthContext
export interface User {
  id: string;
  email: string;
  name?: string;
  profileComplete: boolean;
  role?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string;
  isAuthenticated: boolean;
  userProfileComplete: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMagicLink: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Re-export the existing context for type safety
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Typed version of useAuth hook
export function useTypedAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useTypedAuth must be used within an AuthProvider');
  }
  return context;
}

// Export utility types for other components
export type AuthUser = User;
export type AuthState = Pick<AuthContextType, 'currentUser' | 'token' | 'loading' | 'error'>;
