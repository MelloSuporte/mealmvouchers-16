import axios from 'axios';
import { toast } from "sonner";
import { supabase } from '../config/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/', // Garante que a baseURL está correta
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
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
      const errorMessage = error.response.data?.error || 'Ocorreu um erro';
      
      switch (error.response.status) {
        case 400:
          toast.error('Dados inválidos: ' + errorMessage);
          break;
        case 401:
          toast.error('Sessão expirada');
          break;
        case 403:
          toast.error('Acesso negado');
          break;
        case 404:
          toast.error('Recurso não encontrado: ' + errorMessage);
          break;
        case 409:
          toast.error('Conflito: ' + errorMessage);
          break;
        case 422:
          toast.error('Dados inválidos: ' + errorMessage);
          break;
        case 429:
          toast.error('Muitas requisições');
          break;
        case 500:
          toast.error('Erro interno do servidor');
          break;
        case 503:
          toast.error('Serviço indisponível');
          break;
        default:
          toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

// Supabase helper functions
api.supabase = {
  async query(table) {
    const { data, error } = await supabase
      .from(table)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select()
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

export default api;