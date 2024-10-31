import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Remove duplicate /api prefixes
    if (config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 502) {
      toast.error('Erro de conexão com o servidor. Tentando reconectar...');
      
      if (!originalRequest._retry && originalRequest.retry > 0) {
        originalRequest._retry = true;
        originalRequest.retry--;
        
        await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay(originalRequest._retryCount || 1)));
        
        return api(originalRequest);
      }
    }

    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.code === 'ECONNABORTED') {
      toast.error('Tempo limite de conexão excedido. Por favor, tente novamente.');
    } else if (error.response?.status === 502) {
      toast.error('Servidor indisponível. Por favor, tente novamente mais tarde.');
    } else {
      toast.error(error.response?.data?.error || 'Erro ao processar sua requisição');
    }

    throw error;
  }
);

export default api;