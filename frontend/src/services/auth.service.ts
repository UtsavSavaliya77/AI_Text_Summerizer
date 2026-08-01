import apiClient from '../lib/api-client';

export const authService = {
  async login(credentials: any) {
    // This sends a network request to your backend server
    const res = await apiClient.post('/auth/login', credentials);
    return res.data; 
  },

  async register(data: any) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  }
};