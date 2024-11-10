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
  
  // Log detalhado da requisição
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    headers: config.headers,
    data: config.data
  });
  
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado. Verifique a URL da requisição.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('A requisição demorou muito para responder. Tente novamente.');
    } else {
      const errorMessage = error.response?.data?.erro || error.message;
      toast.error(`Erro na requisição: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;