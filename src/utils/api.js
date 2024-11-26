import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      console.error('URL da requisição:', error.config?.url);
      toast.error('Erro: Rota não encontrada. Por favor, contate o suporte.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('A requisição demorou muito para responder. Tente novamente.');
    } else {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Erro na requisição: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;