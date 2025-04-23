import { API_ENDPOINTS } from '../api/endpoints';

export const apiService = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }
};