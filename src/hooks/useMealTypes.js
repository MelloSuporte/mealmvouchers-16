import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import logger from '../config/logger';

export const useMealTypes = () => {
  return useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      logger.info('Iniciando busca de tipos de refeição...');
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        logger.error('Erro ao buscar tipos de refeição:', error);
        toast.error(`Erro ao buscar tipos de refeição: ${error.message}`);
        throw error;
      }

      logger.info('Tipos de refeição encontrados:', data);
      return data || [];
    }
  });
};