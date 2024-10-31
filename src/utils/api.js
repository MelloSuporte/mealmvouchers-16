import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin + '/api'
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default api;