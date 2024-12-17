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
        
        console.log('Iniciando busca de vouchers...');
        console.log('Configurações da query:', {
          usado: false,
          data_atual: now.toISOString()
        });
        
        // Primeiro, vamos logar todos os vouchers para debug
        const { data: allVouchers, error: debugError } = await supabase
          .from('vouchers_descartaveis')
          .select('*');
          
        console.log('Todos os vouchers na tabela:', allVouchers);

        const { data, error, count } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            *,
            tipos_refeicao (
              id,
              nome,
              valor,
              horario_inicio,
              horario_fim,
              minutos_tolerancia
            )
          `, { count: 'exact' })
          .eq('usado', false)
          .lte('data_expiracao', now.toISOString())
          .order('data_expiracao', { ascending: true });

        if (error) {
          console.error('Erro detalhado ao buscar vouchers:', {
            error,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          toast.error(`Erro ao buscar vouchers: ${error.message}`);
          throw error;
        }

        console.log('Resultado da query filtrada:', {
          total: count,
          vouchers: data,
          primeiroVoucher: data?.[0]
        });

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar vouchers:', {
          error,
          message: error.message,
          stack: error.stack
        });
        toast.error(`Erro ao buscar vouchers: ${error.message}`);
        return [];
      }
    },
    refetchInterval: 5000
  });
};