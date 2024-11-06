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
});

const syncOfflineData = async () => {
  if (!navigator.onLine) return;
  
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const pendingOperations = await store.getAll();
  
  for (const operation of pendingOperations) {
    try {
      await api(operation.request);
      await store.delete(operation.id);
    } catch (error) {
      console.error('Sync failed for operation:', operation);
    }
  }
};

// Tenta sincronizar quando voltar online
window.addEventListener('online', syncOfflineData);

api.interceptors.request.use(
  async config => {
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url;
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
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (!navigator.onLine) {
      const db = await initDB();
      await db.add(STORE_NAME, {
        request: originalRequest,
        timestamp: new Date().toISOString()
      });
      
      toast.info('Operação salva para sincronização posterior');
      return Promise.resolve({ data: { offline: true } });
    }

    if ((error.message === 'Network Error' || error.code === 'ECONNABORTED') && !originalRequest._retry) {
      originalRequest._retry = true;
      toast.error('Erro de conexão. Tentando novamente...');
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, 2000);
      });
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