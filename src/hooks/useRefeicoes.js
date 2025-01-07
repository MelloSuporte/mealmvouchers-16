import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { toast } from "sonner";

export const useRefeicoes = () => {
  return useQuery({
    queryKey: ['refeicoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar refeições:', error);
        toast.error(`Erro ao buscar refeições: ${error.message}`);
        throw error;
      }

      return data || [];
    }
  });
};