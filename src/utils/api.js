import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    
    if (error.response?.status === 404) {
      // Se for uma rota da API, mostra o toast
      if (error.config.url.startsWith('/api/')) {
        toast.error(`Recurso não encontrado - ${errorMessage}`);
      } else {
        // Se for uma rota do frontend, redireciona para a página 404
        window.location.href = '/404';
      }
    } else {
      toast.error(`Erro na requisição: ${errorMessage}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;