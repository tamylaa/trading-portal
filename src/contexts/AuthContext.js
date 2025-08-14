// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { authActions } from '../store/index';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import { normalizeUserData, prepareProfileDataForAPI, isProfileComplete } from '../utils/userDataNormalizer';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;

  // Check if user has completed profile
  const userProfileComplete = currentUser?.profileComplete;

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle magic link verification from URL - support both token and session parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token'); // Direct magic link token
    const sessionToken = params.get('session'); // Session token from auth service redirect
    
    if (sessionToken) {
      console.log('AuthContext: Starting session exchange for session token:', sessionToken);
      exchangeSessionForToken(sessionToken);
      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (token) {
      console.log('AuthContext: Starting direct magic link verification for token:', token);
      verifyMagicLinkToken(token);
      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setToken(null);
        setLoading(false);
        return;
      }

      const { success, user } = await authApi.getCurrentUser();
      if (success) {
        const normalizedUser = normalizeUserData(user);
        setCurrentUser(normalizedUser);
        setToken(token); // Set the token in state
        // Also update Redux
        dispatch(authActions.loginSuccess({ user: normalizedUser, token }));
      } else {
        // Invalid token, clear it
        localStorage.removeItem('authToken');
        setToken(null);
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      localStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async (email, name) => {
    try {
      setError('');
      const { success, message } = await authApi.requestMagicLink(email, name);
      if (!success) {
        throw new Error(message || 'Failed to send magic link');
      }
      return { success: true };
    } catch (err) {
      console.error('Magic link request failed:', err);
      setError(err.message || 'Failed to send magic link');
      throw err;
    }
  };

  const verifyMagicLinkToken = async (token) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('AuthContext: Verifying magic link token...', token);
      
      const { success, token: authToken, user, requiresProfileCompletion } = await authApi.verifyMagicLink(token);
      
      if (success && authToken) {
        localStorage.setItem('authToken', authToken);
        setToken(authToken); // Set token in state
        const normalizedUser = normalizeUserData(user);
        setCurrentUser(normalizedUser);
        // Also update Redux
        dispatch(authActions.loginSuccess({ user: normalizedUser, token: authToken }));
        console.log('AuthContext: Successfully logged in via magic link, user:', normalizedUser);
        // Check if user needs to complete profile
        const needsProfile = requiresProfileCompletion || !isProfileComplete(normalizedUser);
        // Redirect based on profile completion
        const redirectTo = needsProfile ? '/complete-profile' : '/dashboard';
        const from = location.state?.from?.pathname || redirectTo;
        console.log('AuthContext: Navigating to:', from);
        navigate(from, { replace: true });
        return { success: true, user };
      } else {
        throw new Error('Invalid or expired magic link token');
      }
    } catch (err) {
      console.error('AuthContext: Magic link verification failed:', err);
      setError(err.message || 'Failed to complete magic link login');
      navigate('/login', { 
        state: { error: err.message },
        replace: true 
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exchangeSessionForToken = async (sessionToken) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('AuthContext: Exchanging session token for JWT...', sessionToken);
      
      const { success, token: authToken, user } = await authApi.sessionExchange(sessionToken);
      
      if (success && authToken) {
        localStorage.setItem('authToken', authToken);
        setToken(authToken); // Set token in state
        const normalizedUser = normalizeUserData(user);
        setCurrentUser(normalizedUser);
        // Also update Redux
        dispatch(authActions.loginSuccess({ user: normalizedUser, token: authToken }));
        console.log('AuthContext: Successfully logged in via session exchange, user:', normalizedUser);
        // Check if user needs to complete profile
        console.log('AuthContext: Checking profile completion for:', {
          name: normalizedUser.name,
          phone: normalizedUser.phone,
          company: normalizedUser.company,
          position: normalizedUser.position,
          profileComplete: normalizedUser.profileComplete
        });
        const needsProfile = !isProfileComplete(normalizedUser);
        console.log('AuthContext: isProfileComplete returned:', !needsProfile, 'needsProfile:', needsProfile);
        // Redirect based on profile completion
        const redirectTo = needsProfile ? '/complete-profile' : '/dashboard';
        const from = location.state?.from?.pathname || redirectTo;
        console.log('AuthContext: Navigating to:', from);
        navigate(from, { replace: true });
        return { success: true, user };
      } else {
        throw new Error('Invalid or expired session token');
      }
    } catch (err) {
      console.error('AuthContext: Session exchange failed:', err);
      setError(err.message || 'Failed to complete magic link login');
      navigate('/login', { 
        state: { error: err.message },
        replace: true 
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      // Prepare data for API using normalizer
      const apiProfileData = prepareProfileDataForAPI(profileData);
      const result = await authApi.updateProfile(apiProfileData);
      
      if (result.success && result.user) {
        // Normalize the returned user data
        const normalizedUser = normalizeUserData(result.user);
        setCurrentUser(normalizedUser);
        
        console.log('Profile updated successfully in context:', normalizedUser);
        
        // Also refresh user data from API to ensure consistency
        try {
          const refreshResult = await authApi.getCurrentUser();
          if (refreshResult.success) {
            const refreshedNormalizedUser = normalizeUserData(refreshResult.user);
            setCurrentUser(refreshedNormalizedUser);
            console.log('User data refreshed after profile update:', refreshedNormalizedUser);
            return { success: true, user: refreshedNormalizedUser };
          }
        } catch (refreshError) {
          console.warn('Failed to refresh user data after profile update:', refreshError);
          // Still return success since the original update succeeded
        }
        
        return { success: true, user: normalizedUser };
      }
      
      throw new Error(result.error || 'Failed to update profile');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      setCurrentUser(null);
      setToken(null); // Clear token from state
      localStorage.removeItem('authToken');
      // Also update Redux
      dispatch(authActions.logout());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err.message || 'Failed to log out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    token,
    isAuthenticated,
    isProfileComplete: userProfileComplete,
    loading,
    error,
    requestMagicLink,
    verifyMagicLinkToken,
    exchangeSessionForToken,
    updateProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;