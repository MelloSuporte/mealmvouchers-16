import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request Config:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    
    const errorMessage = error.response?.data?.erro || error.message;
    
    if (error.response?.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      toast.error(`Erro: Recurso não encontrado - ${errorMessage}`);
      console.error('404 Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      });
    } else {
      toast.error(`Erro na requisição: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;