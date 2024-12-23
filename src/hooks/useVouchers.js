import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useVouchers = () => {
  return useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de vouchers...');
        const currentDate = new Date().toISOString();
        console.log('Data atual:', currentDate);
        
        const { data, error, count } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            id,
            codigo,
            tipo_refeicao_id,
            data_expiracao,
            usado_em,
            data_uso,
            data_criacao,
            tipos_refeicao (
              id,
              nome,
              valor
            )
          `, { count: 'exact' })
          .or('usado_em.is.null,usado_em.is.null')
          .lte('data_criacao', currentDate)
          .gte('data_expiracao', currentDate)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Erro ao buscar vouchers:', error);
          toast.error(`Erro ao buscar vouchers: ${error.message}`);
          throw error;
        }

        console.log('Query executada:', {
          conditions: {
            dataAtual: currentDate,
            filtros: 'usado_em IS NULL AND data_expiracao >= current_date'
          }
        });

        console.log('Resultado da query:', {
          total: count,
          vouchers: data,
          primeiroVoucher: data?.[0]
        });

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