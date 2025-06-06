import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchUser();
    }
    setLoading(false);
  }, []);

  const fetchUser = async () => {
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
  };

  const login = async (contact, country) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.requestOTP({ contact, country });
      console.log('OTP Response:', response);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 
                         error.response?.data?.message || 
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
      const response = await authApi.verifyOTP({ otpId, otp });
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      setIsAuthenticated(true);
      await fetchUser();
      return response;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
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
