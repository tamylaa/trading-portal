// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;

  // Check if user has completed profile
  const isProfileComplete = currentUser?.profileComplete;

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle magic link verification from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionToken = params.get('session'); // Changed from 'token' to 'session'
    
    if (sessionToken) {
      console.log('AuthContext: Starting session exchange for token:', sessionToken);
      exchangeSessionForToken(sessionToken);
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
        setLoading(false);
        return;
      }

      const { success, user } = await authApi.getCurrentUser();
      if (success) {
        setCurrentUser(user);
      } else {
        // Invalid token, clear it
        localStorage.removeItem('authToken');
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      localStorage.removeItem('authToken');
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

  const exchangeSessionForToken = async (sessionToken) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('AuthContext: Exchanging session token for JWT...', sessionToken);
      
      const { success, token: authToken, user } = await authApi.sessionExchange(sessionToken);
      
      if (success && authToken) {
        localStorage.setItem('authToken', authToken);
        setCurrentUser(user);
        
        console.log('AuthContext: Successfully logged in via magic link, user:', user);
        
        // Check if user needs to complete profile
        const needsProfile = !user.profileComplete;
        
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
      const result = await authApi.updateProfile(profileData);
      
      if (result.success && result.user) {
        // Update the current user in state with the returned user data
        setCurrentUser(prev => ({
          ...prev,
          name: result.user.name || prev.name,
          phone: result.user.phone || '',
          company: result.user.company || '',
          position: result.user.position || '',
          profile: {
            ...prev.profile,
            phone: result.user.phone || '',
            company: result.user.company || '',
            position: result.user.position || ''
          },
          profileComplete: result.user.profileComplete || false,
          isEmailVerified: result.user.isEmailVerified || prev.isEmailVerified
        }));
        
        console.log('Profile updated successfully in context:', result.user);
        return { success: true, user: result.user };
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
      localStorage.removeItem('authToken');
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
    isAuthenticated,
    isProfileComplete,
    loading,
    error,
    requestMagicLink,
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