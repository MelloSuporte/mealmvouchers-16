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
  // Add retry logic
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
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

// Try to sync when back online
window.addEventListener('online', syncOfflineData);

// Request interceptor
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

// Response interceptor with enhanced error handling
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
      
      toast.info('Operação salva para sincronização posterior');
      return Promise.resolve({ data: { offline: true } });
    }

    // Retry on network errors or 502 Bad Gateway
    if ((error.message === 'Network Error' || 
         error.response?.status === 502 || 
         error.code === 'ECONNABORTED') && 
        !originalRequest._retry && 
        originalRequest.retry > 0) {
      
      originalRequest._retry = true;
      originalRequest.retry--;
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, originalRequest.retryDelay(originalRequest.retry));
      });
    }

    // Log error details
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Show user-friendly error message
    const errorMessage = error.response?.data?.error || 
                        'Erro ao processar sua requisição. Por favor, tente novamente.';
    toast.error(errorMessage);
    
    throw error;
  }
);

export default api;