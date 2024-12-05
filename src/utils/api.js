import axios from 'axios';
import { toast } from 'sonner';

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  // Em produção, use a URL do seu servidor
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para logging
api.interceptors.request.use(
  (config) => {
    console.log(`Enviando requisição ${config.method.toUpperCase()} para:`, config.url);
    console.log('Dados da requisição:', config.data);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    toast.error('Erro ao enviar requisição');
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
    
    // Tratamento específico para erro de rede
    if (error.message === 'Network Error') {
      toast.error('Erro de conexão com o servidor. Verifique se o servidor está rodando.');
      return Promise.reject(new Error('Erro de conexão com o servidor'));
    }
    
    // Outros erros
    toast.error(error.response?.data?.error || 'Erro ao processar requisição');
    return Promise.reject(error);
  }
);

export default api;