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

        // Primeiro, vamos verificar se existem registros na tabela backup
        const { count: backupCount, error: backupError } = await supabase
          .from('uso_voucher_backup')
          .select('*', { count: 'exact', head: true });

        if (backupError) {
          logger.error('Erro ao verificar registros na tabela backup:', {
            error: backupError.message,
            code: backupError.code,
            details: backupError.details
          });
        } else {
          logger.info(`Total de registros na tabela backup uso_voucher_backup: ${backupCount}`);
        }

        // Se não houver filtros de data, vamos buscar todos os registros
        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório T');
          
          const { data: allData, error: allError } = await supabase
            .from('uso_voucher_backup')
            .select('*')
            .order('usado_em', { ascending: false })
            .limit(100);

          if (allError) throw allError;

          logger.info(`Busca sem filtros de data retornou ${allData?.length || 0} registros`);
          
          // Mapear os dados para o formato esperado
          const mappedData = allData?.map(item => ({
            id: item.id,
            data_uso: item.usado_em,
            usuario_id: item.usuario_id,
            nome_usuario: 'Usuário Teste', // Valor padrão para teste
            cpf: '000.000.000-00', // Valor padrão para teste
            empresa_id: item.empresa_id || null,
            nome_empresa: 'Empresa Teste', // Valor padrão para teste
            turno: 'Turno Teste', // Valor padrão para teste
            setor_id: 1, // Valor padrão para teste
            nome_setor: 'Setor Teste', // Valor padrão para teste
            tipo_refeicao: item.tipo_refeicao || 'Não especificado',
            valor_refeicao: 0, // Valor padrão para teste
            observacao: item.observacao
          })) || [];

          return mappedData;
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
          .from('uso_voucher_backup')
          .select('*')
          .gte('usado_em', startUtc)
          .lte('usado_em', endUtc);

        if (filters.company && filters.company !== 'all') {
          logger.info(`Aplicando filtro de empresa: ${filters.company}`);
          query = query.eq('empresa_id', filters.company);
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
            query: query.toString()
          });
          return [];
        }

        // Mapear os dados da tabela backup para o formato esperado
        const mappedData = data.map(item => ({
          id: item.id,
          data_uso: item.usado_em,
          usuario_id: item.usuario_id,
          nome_usuario: 'Usuário Teste', // Valor padrão para teste
          cpf: '000.000.000-00', // Valor padrão para teste
          empresa_id: item.empresa_id || null,
          nome_empresa: 'Empresa Teste', // Valor padrão para teste
          turno: 'Turno Teste', // Valor padrão para teste
          setor_id: 1, // Valor padrão para teste
          nome_setor: 'Setor Teste', // Valor padrão para teste
          tipo_refeicao: item.tipo_refeicao || 'Não especificado',
          valor_refeicao: 0, // Valor padrão para teste
          observacao: item.observacao
        }));

        logger.info(`Consulta concluída. Registros encontrados: ${mappedData.length}`);
        return mappedData;

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