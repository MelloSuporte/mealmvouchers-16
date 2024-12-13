import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useMealTypes = () => {
  return useQuery({
    queryKey: ['tipos-refeicao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('nome')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar tipos de refeição:', error);
        toast.error('Erro ao carregar tipos de refeição');
        throw error;
      }
      
      return data?.map(tipo => tipo.nome) || [];
    }
  });
};