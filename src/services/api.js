import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export const mealTypesApi = {
  getAll: async () => {
    const response = await api.get('/meal-types');
    return response.data;
  },
  create: async (mealType) => {
    const response = await api.post('/meal-types', mealType);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/meal-types/${id}`, data);
    return response.data;
  }
};