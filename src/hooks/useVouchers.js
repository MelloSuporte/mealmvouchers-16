import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useVouchers = () => {
  return useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      try {
        // Cria data com timezone de São Paulo
        const now = new Date();
        const saoPauloDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        saoPauloDate.setHours(0, 0, 0, 0); // Início do dia
        
        console.log('Iniciando busca de vouchers...');
        console.log('Data atual (São Paulo):', saoPauloDate.toISOString());

        // Debug: Verificar todos os vouchers
        const { data: allVouchers, error: debugError } = await supabase
          .from('vouchers_descartaveis')
          .select('*');
          
        console.log('Todos os vouchers na tabela:', allVouchers);

        // Query com os filtros
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
          .gte('data_expiracao', saoPauloDate.toISOString().split('T')[0]);

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