import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useMealTypes = () => {
  return useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      console.log('Iniciando busca de tipos de refeição...');
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar tipos de refeição:', error);
        toast.error(`Erro ao buscar tipos de refeição: ${error.message}`);
        throw error;
      }

      console.log('Tipos de refeição encontrados:', data);
      return data || [];
    }
  });
};