import axios from 'axios';
import { toast } from "sonner";
import { supabase } from '../config/supabase';

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

// Funções auxiliares para o Supabase
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