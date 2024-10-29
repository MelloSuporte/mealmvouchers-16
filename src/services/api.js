import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export const voucherApi = {
  validate: async (code) => {
    const response = await api.post('/api/vouchers/validate', { code });
    return response.data;
  },
  
  checkUsage: async (userId, date) => {
    const response = await api.get(`/api/vouchers/usage/${userId}/${date}`);
    return response.data;
  },
  
  useVoucher: async (userId, mealTypeId) => {
    const response = await api.post('/api/vouchers/use', { 
      userId, 
      mealTypeId 
    });
    return response.data;
  }
};

export const mealTypesApi = {
  getAll: async () => {
    const response = await api.get('/api/meal-types');
    return response.data;
  },
  
  create: async (mealType) => {
    const response = await api.post('/api/meal-types', mealType);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/api/meal-types/${id}`, data);
    return response.data;
  }
};