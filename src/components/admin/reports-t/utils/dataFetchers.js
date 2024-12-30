import { supabase } from '@/config/supabase';
import { mapVoucherData } from './dataMappers';
import logger from '@/config/logger';
import { toast } from "sonner";

export const fetchAllVoucherData = async () => {
  logger.info('Iniciando busca de todos os registros de voucher');
  
  const { data, error } = await supabase
    .from('vw_uso_voucher_detalhado')
    .select('*')
    .order('data_uso', { ascending: false })
    .limit(100);

  if (error) {
    logger.error('Erro ao buscar todos os registros:', error);
    throw error;
  }

  logger.info(`Busca sem filtros retornou ${data?.length || 0} registros`);
  return mapVoucherData(data);
};

export const fetchFilteredVoucherData = async (startUtc, endUtc, filters) => {
  logger.info('Iniciando busca filtrada de registros de voucher:', {
    startUtc,
    endUtc,
    filters
  });

  let query = supabase
    .from('vw_uso_voucher_detalhado')
    .select('*')
    .gte('data_uso', startUtc)
    .lte('data_uso', endUtc);

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
    logger.error('Erro na consulta do relatório:', {
      error: error.message,
      code: error.code,
      details: error.hint,
      query: query.toString()
    });
    toast.error('Erro ao buscar dados: ' + error.message);
    throw error;
  }

  if (!data || data.length === 0) {
    logger.warn('Nenhum registro encontrado com os filtros aplicados', {
      filters: filters,
      periodo: { inicio: startUtc, fim: endUtc },
      query: query.toString()
    });
    return [];
  }

  logger.info('Consulta filtrada concluída:', {
    totalRegistros: data.length,
    primeiroRegistro: data[0],
    ultimoRegistro: data[data.length - 1]
  });

  return mapVoucherData(data);
};