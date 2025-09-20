// 🔐 Enhanced Authentication Slice
// Modular, Robust, User-Empowering Auth State

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import { normalizeUserData, isProfileComplete } from '../../utils/userDataNormalizer';

// 📝 TypeScript Interfaces for Robust Type Safety
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  position?: string;
  profileComplete: boolean;
  lastLogin?: string;
  preferences?: UserPreferences;
  permissions?: string[];
  avatar?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    trades: boolean;
    system: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

export interface AuthState {
  // Core auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Loading states for fluid UX
  loading: {
    login: boolean;
    logout: boolean;
    profile: boolean;
    verification: boolean;
  };
  
  // Error handling for robustness
  errors: {
    login?: string;
    profile?: string;
    network?: string;
  };
  
  // User experience enhancements
  loginHistory: Array<{
    timestamp: string;
    device: string;
    location?: string;
  }>;
  
  // Security features
  sessionExpiry: string | null;
  mfaRequired: boolean;
  biometricEnabled: boolean;
}

// 🎯 Initial State - Clean and Predictable
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: {
    login: false,
    logout: false,
    profile: false,
    verification: false,
  },
  errors: {},
  loginHistory: [],
  sessionExpiry: null,
  mfaRequired: false,
  biometricEnabled: false,
};

// 🚀 Async Thunks - Scalable API Actions
export const requestMagicLink = createAsyncThunk(
  'auth/requestMagicLink',
  async ({ email, name }: { email: string; name?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.requestMagicLink(email, name);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send magic link');
    }
  }
);

export const verifyMagicLink = createAsyncThunk(
  'auth/verifyMagicLink',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyMagicLink(token);
      if (response.success && response.token && response.user) {
        return {
          token: response.token,
          user: normalizeUserData(response.user),
          requiresProfileCompletion: 'requiresProfileCompletion' in response ? response.requiresProfileCompletion || false : false,
        };
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify magic link');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue, getState }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      if (response.success && response.user) {
        return normalizeUserData(response.user);
      }
      const errorMsg = 'error' in response ? response.error : 'Failed to update profile';
      throw new Error(String(errorMsg));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.user) {
        return normalizeUserData(response.user);
      }
      throw new Error('Failed to get user data');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user data');
    }
  }
);

// 🎨 Auth Slice - Fluid, User-Centric State Management
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔄 Immediate UI Actions
    clearErrors: (state) => {
      state.errors = {};
    },
    
    clearError: (state, action: PayloadAction<keyof AuthState['errors']>) => {
      delete state.errors[action.payload];
    },
    
    setMfaRequired: (state, action: PayloadAction<boolean>) => {
      state.mfaRequired = action.payload;
    },
    
    enableBiometric: (state) => {
      state.biometricEnabled = true;
    },
    
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        } as UserPreferences;
      }
    },
    
    addLoginRecord: (state, action: PayloadAction<{ device: string; location?: string }>) => {
      state.loginHistory.unshift({
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
      // Keep only last 10 login records
      if (state.loginHistory.length > 10) {
        state.loginHistory = state.loginHistory.slice(0, 10);
      }
    },
    
    logout: (state) => {
      // Clear all auth state while preserving structure
      return {
        ...initialState,
        // Preserve some non-sensitive preferences
        loginHistory: state.loginHistory,
      };
    },
  },
  
  extraReducers: (builder) => {
    // 📧 Magic Link Request
    builder
      .addCase(requestMagicLink.pending, (state) => {
        state.loading.login = true;
        delete state.errors.login;
      })
      .addCase(requestMagicLink.fulfilled, (state) => {
        state.loading.login = false;
      })
      .addCase(requestMagicLink.rejected, (state, action) => {
        state.loading.login = false;
        state.errors.login = action.payload as string;
      });
    
    // ✅ Magic Link Verification
    builder
      .addCase(verifyMagicLink.pending, (state) => {
        state.loading.verification = true;
        delete state.errors.login;
      })
      .addCase(verifyMagicLink.fulfilled, (state, action) => {
        state.loading.verification = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user as User;
        state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(verifyMagicLink.rejected, (state, action) => {
        state.loading.verification = false;
        state.errors.login = action.payload as string;
      });
    
    // 👤 Profile Update
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading.profile = true;
        delete state.errors.profile;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.user = action.payload as User;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload as string;
      });
    
    // 🔄 Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading.verification = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading.verification = false;
        state.isAuthenticated = true;
        state.user = action.payload as User;
        state.token = localStorage.getItem('authToken');
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading.verification = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('authToken');
      });
  },
});

// 🎯 Action Creators Export
export const {
  clearErrors,
  clearError,
  setMfaRequired,
  enableBiometric,
  updateUserPreferences,
  addLoginRecord,
  logout,
} = authSlice.actions;

// 🔍 Selectors - Optimized for Performance and Reusability
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthErrors = (state: { auth: AuthState }) => state.auth.errors;
export const selectUserPreferences = (state: { auth: AuthState }) => state.auth.user?.preferences;
export const selectIsProfileComplete = (state: { auth: AuthState }) => 
  state.auth.user ? isProfileComplete(state.auth.user) : false;

export default authSlice.reducer;
