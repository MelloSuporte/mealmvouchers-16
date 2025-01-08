import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { toast } from "sonner";
import logger from '../config/logger';

export const useRefeicoes = () => {
  return useQuery({
    queryKey: ['refeicoes'],
    queryFn: async () => {
      logger.info('Buscando refeições...');
      
      const { data, error } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        logger.error('Erro ao buscar refeições:', error);
        toast.error(`Erro ao buscar refeições: ${error.message}`);
        throw error;
      }

      logger.info('Refeições encontradas:', data?.length || 0);
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};

export default useRefeicoes;