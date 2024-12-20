import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados do relatório T com filtros:', filters);

        // Primeiro, vamos verificar se existem registros na tabela base
        const { count: baseCount, error: baseError } = await supabase
          .from('uso_voucher')
          .select('*', { count: 'exact', head: true });

        if (baseError) {
          logger.error('Erro ao verificar registros na tabela base:', {
            error: baseError.message,
            code: baseError.code,
            details: baseError.details
          });
        } else {
          logger.info(`Total de registros na tabela base uso_voucher: ${baseCount}`);
        }

        // Verificar registros na view
        const { count, error: countError } = await supabase
          .from('vw_uso_voucher_detalhado')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          logger.error('Erro ao verificar registros na view:', {
            error: countError.message,
            code: countError.code,
            details: countError.details
          });
          throw countError;
        }

        logger.info(`Total de registros na view: ${count}`);

        if (count === 0) {
          logger.warn('A view vw_uso_voucher_detalhado está vazia. Verificando possíveis causas...');
          
          // Verificar se há registros recentes
          const { data: recentData, error: recentError } = await supabase
            .from('uso_voucher')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentError) {
            logger.error('Erro ao verificar registros recentes:', recentError);
          } else if (recentData && recentData.length > 0) {
            logger.info(`Último registro encontrado em: ${recentData[0].created_at}`);
          } else {
            logger.warn('Nenhum registro recente encontrado na tabela base');
          }
          
          return [];
        }

        // Se não houver filtros de data, vamos buscar todos os registros
        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório T');
          
          const { data: allData, error: allError } = await supabase
            .from('vw_uso_voucher_detalhado')
            .select('*')
            .order('data_uso', { ascending: false })
            .limit(100);

          if (allError) throw allError;

          logger.info(`Busca sem filtros de data retornou ${allData?.length || 0} registros`);
          return allData || [];
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
        
        logger.info('Parâmetros de consulta:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select(`
            id,
            data_uso,
            usuario_id,
            nome_usuario,
            cpf,
            empresa_id,
            nome_empresa,
            turno,
            setor_id,
            nome_setor,
            tipo_refeicao,
            valor_refeicao,
            observacao
          `)
          .gte('data_uso', startUtc)
          .lte('data_uso', endUtc);

        logger.info('Construindo query com filtros adicionais');

        if (filters.company && filters.company !== 'all') {
          logger.info(`Aplicando filtro de empresa: ${filters.company}`);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          logger.info(`Aplicando filtro de turno: ${filters.shift}`);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          logger.info(`Aplicando filtro de setor: ${filters.sector}`);
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          logger.info(`Aplicando filtro de tipo de refeição: ${filters.mealType}`);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Erro na consulta do relatório T:', {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        if (!data || data.length === 0) {
          logger.warn('Nenhum registro encontrado com os filtros aplicados', {
            filters: filters,
            query: query.toString() // Log da query construída
          });
          return [];
        }

        logger.info(`Consulta concluída. Registros encontrados: ${data.length}`);
        return data;

      } catch (error) {
        logger.error('Erro ao buscar dados do relatório T:', {
          error: error.message,
          stack: error.stack,
          filters: filters
        });
        toast.error('Falha ao carregar dados: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
};