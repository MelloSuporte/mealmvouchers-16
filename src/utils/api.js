import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logging
api.interceptors.request.use(
  (config) => {
    console.log('URL da requisição:', config.url);
    console.log('Dados da requisição:', config.data);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta da API:', response.data);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;