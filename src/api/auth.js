import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:8787'
  : 'https://tamyla-auth-staging.workers.dev';  // Use the actual Cloudflare Worker URL

export const authApi = {
  requestOTP: async ({ contact, country = 'IN' }) => {
    try {
      // Determine if the contact is an email or phone number
      const isEmail = contact.includes('@');
      const payload = isEmail 
        ? { email: contact }
        : { phone: contact, countryCode: country };

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/request-otp`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('OTP Request Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
                         error.response?.statusText || 
                         error.message || 
                         'Failed to send OTP';
      throw new Error(errorMessage);
    }
  },
  
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

  verifyOTP: async (otpId, otp) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        { otpId, otp },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('OTP Verification Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
                         error.response?.statusText || 
                         error.message || 
                         'Failed to verify OTP';
      throw new Error(errorMessage);
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
