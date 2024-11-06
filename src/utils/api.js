import axios from 'axios';
import { toast } from "sonner";
import { openDB } from 'idb';

const DB_NAME = 'voucher_offline_db';
const STORE_NAME = 'pending_operations';

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptador de requisições
api.interceptors.request.use(
  config => {
    // Adiciona timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    return config;
  },
  error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptador de respostas
api.interceptors.response.use(
  response => response,
  async error => {
    // Trata erros de rede
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      return Promise.reject(error);
    }

    // Trata timeout
    if (error.code === 'ECONNABORTED') {
      toast.error('A conexão demorou muito para responder. Tente novamente.');
      return Promise.reject(error);
    }

    // Trata erros do servidor
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Ocorreu um erro. Tente novamente.';
      
      switch (error.response.status) {
        case 400:
          toast.error('Dados inválidos: ' + errorMessage);
          break;
        case 401:
          toast.error('Sessão expirada. Faça login novamente.');
          break;
        case 403:
          toast.error('Acesso negado.');
          break;
        case 404:
          toast.error('Recurso não encontrado.');
          break;
        case 409:
          toast.error('Conflito: ' + errorMessage);
          break;
        case 422:
          toast.error('Dados inválidos: ' + errorMessage);
          break;
        case 429:
          toast.error('Muitas requisições. Aguarde um momento.');
          break;
        case 500:
          toast.error('Erro interno do servidor. Tente novamente.');
          break;
        case 503:
          toast.error('Serviço indisponível. Tente novamente em alguns instantes.');
          break;
        default:
          toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

export default api;