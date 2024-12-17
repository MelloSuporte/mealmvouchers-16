import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useVouchers = () => {
  return useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        console.log('Buscando vouchers ativos...');
        
        const { data, error } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            *,
            tipos_refeicao (
              nome,
              valor,
              horario_inicio,
              horario_fim,
              minutos_tolerancia
            )
          `)
          .eq('usado', false)
          .gte('data_expiracao', now.toISOString())
          .order('data_expiracao', { ascending: true });

        if (error) {
          console.error('Erro ao buscar vouchers:', error);
          toast.error(`Erro ao buscar vouchers: ${error.message}`);
          throw error;
        }

        console.log('Vouchers ativos encontrados:', data);
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar vouchers:', error);
        toast.error(`Erro ao buscar vouchers: ${error.message}`);
        return [];
      }
    },
    refetchInterval: 5000
  });
};