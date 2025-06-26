import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      if (token) {
        const userData = await authApi.getUser(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setError(error.message || 'Failed to fetch user');
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchUser();
    }
    setLoading(false);
  }, [fetchUser]);

  const login = async ({ contact, country = 'IN' }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate contact is not empty
      if (!contact) {
        throw new Error('Email or phone number is required');
      }
      
      const response = await authApi.requestOTP({ contact, country });
      console.log('OTP Response:', response);
      
      if (!response.otpId) {
        throw new Error('Invalid response from server: Missing OTP ID');
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to request OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otpId, otp) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!otpId || !otp) {
        throw new Error('OTP ID and OTP are required');
      }
      
      const response = await authApi.verifyOTP(otpId, otp);
      
      if (!response.token) {
        throw new Error('Invalid response from server: Missing authentication token');
      }
      
      // Store the token and update auth state
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setIsAuthenticated(true);
      
      // Fetch user data
      await fetchUser();
      
      return response;
    } catch (error) {
      console.error('OTP verification failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to verify OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        verifyOTP,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
