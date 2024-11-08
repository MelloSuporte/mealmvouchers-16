import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

api.interceptors.response.use(
  response => {
    if (!response.data) {
      console.warn('Empty response received');
      return { ...response, data: [] };
    }
    return response;
  },
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
      
      switch (error.response.status) {
        case 400:
          toast.error(`Dados inválidos: ${errorMessage}`);
          break;
        case 401:
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
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
          toast.error('Muitas requisições. Tente novamente em alguns instantes.');
          break;
        case 500:
          toast.error(`Erro interno do servidor: ${errorMessage}`);
          break;
        case 503:
          toast.error('Serviço temporariamente indisponível');
          break;
        default:
          toast.error(errorMessage);
      }
    } else {
      toast.error('Erro na comunicação com o servidor');
    }

    return Promise.reject(error);
  }
);

export default api;