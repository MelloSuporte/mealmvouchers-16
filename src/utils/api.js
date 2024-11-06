import axios from 'axios';
import { toast } from "sonner";
import { openDB } from 'idb';

const DB_NAME = 'voucher_offline_db';
const STORE_NAME = 'pending_operations';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: (retryCount) => {
    return Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff with 10s max
  }
});

// Response interceptor with enhanced error handling and retry logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle offline mode
    if (!navigator.onLine) {
      const db = await initDB();
      await db.add(STORE_NAME, {
        request: originalRequest,
        timestamp: new Date().toISOString()
      });
      
      toast.info('Operação salva para sincronização quando houver conexão');
      return Promise.resolve({ data: { offline: true } });
    }

    // Enhanced retry logic for network errors
    if ((error.message === 'Network Error' || 
         error.response?.status === 502 || 
         error.code === 'ECONNABORTED') && 
        !originalRequest._retry && 
        originalRequest.retry > 0) {
      
      originalRequest._retry = true;
      originalRequest.retry--;
      
      const retryCount = 3 - originalRequest.retry;
      const delayMs = originalRequest.retryDelay(retryCount);
      
      toast.info(`Tentativa ${retryCount + 1} de 3 de reconexão ao servidor...`, {
        duration: delayMs,
      });
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, delayMs);
      });
    }

    // Handle specific error types
    const errorResponse = error.response?.data;
    let errorMessage = 'Erro ao processar sua requisição';

    if (error.response?.status === 401) {
      errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Você não tem permissão para realizar esta ação.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Recurso não encontrado.';
    } else if (error.response?.status === 422) {
      errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Erro no servidor. Por favor, tente novamente em alguns instantes.';
    }

    // Use error message from server if available
    if (errorResponse?.message) {
      errorMessage = errorResponse.message;
    }

    if (!originalRequest._retry || originalRequest.retry === 0) {
      toast.error(errorMessage);
    }

    throw error;
  }
);

export default api;