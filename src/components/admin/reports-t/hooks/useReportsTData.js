import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

const checkBackupRecords = async () => {
  const { count, error } = await supabase
    .from('uso_voucher_backup')
    .select('*', { count: 'exact', head: true });

  if (error) {
    logger.error('Erro ao verificar registros na tabela backup:', {
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else {
    logger.info(`Total de registros na tabela backup uso_voucher_backup: ${count}`);
  }

  return count;
};

const mapBackupData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.usado_em,
    usuario_id: item.usuario_id,
    nome_usuario: 'Usuário Teste',
    cpf: '000.000.000-00',
    empresa_id: item.empresa_id || null,
    nome_empresa: 'Empresa Teste',
    turno: 'Turno Teste',
    setor_id: 1,
    nome_setor: 'Setor Teste',
    tipo_refeicao: item.tipo_refeicao || 'Não especificado',
    valor_refeicao: 0,
    observacao: item.observacao
  })) || [];
};

const fetchAllData = async () => {
  const { data, error } = await supabase
    .from('uso_voucher_backup')
    .select('*')
    .order('usado_em', { ascending: false })
    .limit(100);

  if (error) throw error;

  logger.info(`Busca sem filtros de data retornou ${data?.length || 0} registros`);
  return mapBackupData(data);
};

const fetchFilteredData = async (startUtc, endUtc, filters) => {
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
      details: error.hint
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

  logger.info(`Consulta concluída. Registros encontrados: ${data.length}`);
  return mapBackupData(data);
};

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados do relatório T com filtros:', filters);

        // Verifica registros na tabela backup
        await checkBackupRecords();

        // Se não houver filtros de data, busca todos os registros
        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório T');
          return fetchAllData();
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(
          startOfDay(filters.startDate), 
          timeZone, 
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );
        const endUtc = formatInTimeZone(
          endOfDay(filters.endDate), 
          timeZone, 
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );
        
        logger.info('Parâmetros de consulta:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        return fetchFilteredData(startUtc, endUtc, filters);

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