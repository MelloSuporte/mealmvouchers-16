import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useVouchers = () => {
  return useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de vouchers...');
        
        // Primeiro, vamos verificar se a tabela existe e tem registros
        const { count: totalCount } = await supabase
          .from('vouchers_descartaveis')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total de registros na tabela:', totalCount);

        // Agora fazemos a consulta principal
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
          `)
          .is('usado_em', null)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Erro ao buscar vouchers:', error);
          toast.error(`Erro ao buscar vouchers: ${error.message}`);
          throw error;
        }

        // Log detalhado dos resultados
        console.log('Detalhes da consulta:', {
          totalRegistros: totalCount,
          registrosRetornados: data?.length || 0,
          primeiroRegistro: data?.[0] || null,
          erro: error
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