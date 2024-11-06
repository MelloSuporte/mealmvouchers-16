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

// Configuração do axios com timeout aumentado e retries
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // Aumentado para 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: (retryCount) => {
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  }
});

// Log de requisições
api.interceptors.request.use(
  config => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Log de respostas e tratamento de erros melhorado
api.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async error => {
    console.error('[API Error Details]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;

    // Modo offline
    if (!navigator.onLine) {
      console.log('[API] Dispositivo offline, salvando operação para sincronização posterior');
      const db = await initDB();
      await db.add(STORE_NAME, {
        request: originalRequest,
        timestamp: new Date().toISOString()
      });
      
      toast.info('Operação salva para sincronização quando houver conexão');
      return Promise.resolve({ data: { offline: true } });
    }

    // Lógica de retry para erros de rede
    if ((error.message === 'Network Error' || 
         error.response?.status === 502 || 
         error.code === 'ECONNABORTED') && 
        !originalRequest._retry && 
        originalRequest.retry > 0) {
      
      originalRequest._retry = true;
      originalRequest.retry--;
      
      const retryCount = 3 - originalRequest.retry;
      const delayMs = originalRequest.retryDelay(retryCount);
      
      console.log(`[API] Tentativa ${retryCount + 1} de reconexão em ${delayMs}ms`);
      
      toast.info(`Tentando reconectar ao servidor... (${retryCount + 1}/3)`, {
        duration: delayMs,
      });
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, delayMs);
      });
    }

    // Mensagens de erro específicas
    let errorMessage = 'Erro ao processar sua requisição';

    if (!navigator.onLine) {
      errorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'A conexão demorou muito para responder. Tente novamente.';
    } else if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
          break;
        case 401:
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado.';
          break;
        case 408:
          errorMessage = 'Tempo de requisição esgotado. Tente novamente.';
          break;
        case 429:
          errorMessage = 'Muitas requisições. Aguarde um momento e tente novamente.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Nossa equipe foi notificada.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.';
          break;
        default:
          errorMessage = error.response.data?.message || 'Erro desconhecido. Tente novamente.';
      }
    }

    if (!originalRequest._retry || originalRequest.retry === 0) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Sincronização de operações offline
window.addEventListener('online', async () => {
  console.log('[API] Conexão restaurada, sincronizando operações pendentes');
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const pendingOps = await store.getAll();

  if (pendingOps.length > 0) {
    toast.info(`Sincronizando ${pendingOps.length} operações pendentes...`);
    
    for (const op of pendingOps) {
      try {
        await api(op.request);
        await store.delete(op.id);
      } catch (error) {
        console.error('[API] Erro ao sincronizar operação:', error);
      }
    }
    
    toast.success('Sincronização concluída!');
  }
});

export default api;