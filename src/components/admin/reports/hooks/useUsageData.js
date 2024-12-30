import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.user) {
          logger.warn('Usuário não autenticado, mas continuando a busca...');
        }

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas');
          return [];
        }

        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*');

        // Apply filters
        if (filters.startDate) {
          query = query.gte('data_uso', filters.startDate.toISOString());
        }

        if (filters.endDate) {
          query = query.lte('data_uso', filters.endDate.toISOString());
        }

        if (filters.company && filters.company !== 'all') {
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        logger.info('Dados retornados:', {
          totalRegistros: data?.length || 0,
          primeiroRegistro: data?.[0],
          ultimoRegistro: data?.[data?.length - 1]
        });

        // Sincronizar com a tabela de relatório
        if (data && data.length > 0) {
          await syncReportData(data);
        }

        return data || [];
      } catch (error) {
        logger.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};

// Função auxiliar para sincronizar dados com a tabela de relatório
const syncReportData = async (data) => {
  try {
    const { error } = await supabase
      .from('relatorio_uso_voucher')
      .upsert(
        data.map(item => ({
          data_uso: item.data_uso,
          usuario_id: item.usuario_id,
          nome_usuario: item.nome_usuario,
          cpf: item.cpf,
          empresa_id: item.empresa_id,
          nome_empresa: item.nome_empresa,
          turno: item.turno,
          setor_id: item.setor_id,
          nome_setor: item.nome_setor,
          tipo_refeicao: item.tipo_refeicao,
          valor: item.valor_refeicao,
          observacao: item.observacao
        })),
        { onConflict: ['data_uso', 'usuario_id', 'tipo_refeicao'] }
      );

    if (error) {
      logger.error('Erro ao sincronizar dados do relatório:', error);
    } else {
      logger.info('Dados do relatório sincronizados com sucesso');
    }
  } catch (error) {
    logger.error('Erro ao sincronizar dados do relatório:', error);
  }
};