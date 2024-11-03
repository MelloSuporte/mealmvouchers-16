import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
    // Ensure URL starts with /api
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url;
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
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

    // Retry logic for network errors
    if (error.message === 'Network Error' && !originalRequest._retry) {
      originalRequest._retry = true;
      toast.error('Erro de conexão. Tentando novamente...');
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 2000);
      });
    }

    if (error.response?.status === 404) {
      console.error('API Endpoint not found:', originalRequest.url);
      toast.error('Erro: Endpoint não encontrado. Por favor, contate o suporte.');
    }

    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    toast.error(error.response?.data?.error || 'Erro ao processar sua requisição');
    throw error;
  }
);

export default api;