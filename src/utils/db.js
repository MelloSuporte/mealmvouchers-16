import api from './api';
import { toast } from "sonner";

export const executeQuery = async (query, params = []) => {
  try {
    const response = await api.post('/api/query', { query, params });
    return response.data;
  } catch (error) {
    toast.error('Database error: ' + (error.response?.data?.error || error.message));
    throw error;
  }
};