// Type declarations for AuthContext.js
// This file provides TypeScript types for the JavaScript AuthContext

import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export function useAuth(): AuthContextType;
export function AuthProvider(props: AuthProviderProps): JSX.Element;
