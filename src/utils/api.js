import axios from 'axios';
import { toast } from 'sonner';

const getBaseURL = () => {
  return import.meta.env.VITE_SUPABASE_URL || 'https://bhjbydrcrksvmmpvslbo.supabase.co';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }
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
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta da API:', response.data);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    
    if (!error.response) {
      const errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
      toast.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao processar requisição';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;