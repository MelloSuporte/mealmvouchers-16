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
  return config;
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    
    if (error.response?.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      toast.error(`Erro: Recurso não encontrado - ${errorMessage}`);
    } else {
      toast.error(`Erro na requisição: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;