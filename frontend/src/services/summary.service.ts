import apiClient from '../lib/api-client';

export const summaryService = {
  async getAll() {
    const res = await apiClient.get('/summaries');
    return res.data.data.summaries;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/summaries/${id}`);
    return res.data.data.summary;
  },

  async delete(id: string) {
    const res = await apiClient.delete(`/summaries/${id}`);
    return res.data;
  }
};
