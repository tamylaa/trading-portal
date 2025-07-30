import axios from 'axios';

// Create a custom Axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if using them
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access (e.g., token expired)
        localStorage.removeItem('authToken');
        // You might want to redirect to login here or handle it in the component
        console.error('Authentication error:', data.message || 'Please log in again');
      } else if (status === 403) {
        // Handle forbidden access
        console.error('Forbidden:', data.message || 'You do not have permission to access this resource');
      } else if (status === 404) {
        // Handle not found
        console.error('Resource not found:', data.message || 'The requested resource was not found');
      } else if (status >= 500) {
        // Handle server errors
        console.error('Server error:', data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', 'Could not connect to the server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
