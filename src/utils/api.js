import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Adiciona timestamp para evitar cache em requisições GET
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet');
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED') {
      toast.error('A conexão demorou muito para responder');
      return Promise.reject(error);
    }

    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.message || 'Ocorreu um erro';
      const errorDetails = error.response.data?.details;
      
      switch (error.response.status) {
        case 400:
          toast.error(`Dados inválidos: ${errorMessage}`);
          break;
        case 401:
          toast.error('Sessão expirada');
          break;
        case 403:
          toast.error('Acesso negado');
          break;
        case 404:
          toast.error(`Recurso não encontrado: ${errorMessage}`);
          break;
        case 409:
          toast.error(`Conflito: ${errorMessage}`);
          break;
        case 422:
          toast.error(`Dados inválidos: ${errorMessage}`);
          break;
        case 429:
          toast.error('Muitas requisições');
          break;
        case 500:
          toast.error(`Erro interno do servidor: ${errorMessage}`);
          break;
        case 503:
          toast.error('Serviço indisponível');
          break;
        default:
          toast.error(errorMessage);
      }

      if (errorDetails && process.env.NODE_ENV === 'development') {
        console.error('Error details:', errorDetails);
      }
    }

    return Promise.reject(error);
  }
);

export default api;