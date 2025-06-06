import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:8787'
  : 'https://tamyla-auth-staging.workers.dev';  // Use the actual Cloudflare Worker URL

export const authApi = {
  login: async (email, useOtp = false) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, useOtp },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
                         error.response?.statusText || 
                         error.message || 
                         'Failed to login';
      throw new Error(errorMessage);
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        { email, otp }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify OTP');
    }
  },

  getUser: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user information');
    }
  }
};
