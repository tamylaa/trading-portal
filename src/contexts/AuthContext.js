import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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

  const verifyMagicLink = useCallback(async (token) => {
    try {
      setLoading(true);
      setError('');
      
      const { success, token: authToken, user } = await authApi.verifyMagicLink(token);
      
      if (success && authToken) {
        localStorage.setItem('authToken', authToken);
        setCurrentUser(user);
        
        // Redirect to dashboard or intended URL
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        
        return { success: true, user };
      } else {
        throw new Error('Invalid or expired magic link');
      }
    } catch (err) {
      console.error('Magic link verification failed:', err);
      setError(err.message || 'Failed to verify magic link');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate, location.state]);

  // Check for existing session on initial load
  useEffect(() => {
    checkAuthStatus();
    
    // Check for magic link in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      verifyMagicLink(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, verifyMagicLink]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const { success, user } = await authApi.getCurrentUser(token);
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

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    requestMagicLink,
    verifyMagicLink,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
