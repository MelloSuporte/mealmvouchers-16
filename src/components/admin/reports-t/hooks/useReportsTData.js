import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados com filtros:', filters);

        // Se o tipo de voucher for descartável, usar a tabela vouchers_descartaveis
        if (filters?.voucherType === 'descartavel') {
          let query = supabase
            .from('vouchers_descartaveis')
            .select(`
              *,
              tipos_refeicao (
                id,
                nome,
                valor
              ),
              admin_users (
                nome
              )
            `);

          // Aplicar filtros de data
          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            query = query.gte('data_requisicao', startDate.toISOString());
          }

          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte('data_requisicao', endDate.toISOString());
          }

          const { data: vouchersData, error: vouchersError } = await query;

          if (vouchersError) {
            logger.error('Erro ao buscar vouchers descartáveis:', vouchersError);
            toast.error('Erro ao carregar dados do relatório');
            throw vouchersError;
          }

          return vouchersData || [];
        }

        // Para outros tipos de voucher, manter a lógica existente
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select(`
            id,
            data_uso,
            nome_usuario,
            cpf,
            empresa_id,
            nome_empresa,
            turno,
            setor_id,
            nome_setor,
            tipo_refeicao,
            valor_refeicao,
            codigo_voucher,
            tipo_voucher
          `)
          .eq('tipo_voucher', 'comum');

        // Aplicar filtros
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          query = query.gte('data_uso', startDate.toISOString());
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte('data_uso', endDate.toISOString());
        }

        if (filters.company && filters.company !== 'all') {
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('turno', filters.shift);
        }

        // Alterado para filtrar por nome_setor em vez de setor_id
        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('nome_setor', filters.sector);
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

        const formattedData = data?.map(item => ({
          id: item.id,
          usado_em: item.data_uso,
          nome_pessoa: item.nome_usuario,
          nome_empresa: item.nome_empresa,
          codigo: item.codigo_voucher,
          tipos_refeicao: {
            nome: item.tipo_refeicao,
            valor: item.valor_refeicao
          },
          turno: item.turno,
          setor: item.nome_setor
        })) || [];

        logger.info('Dados formatados:', formattedData);
        return formattedData;

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