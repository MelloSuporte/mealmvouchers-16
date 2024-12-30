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

  // Modificando a lógica de filtragem para turno
  if (filters.shift && filters.shift !== 'all') {
    const turnoId = filters.shift.toString();
    logger.info(`Aplicando filtro de turno: ${turnoId}`);
    query = query.eq('turno_id', turnoId);
  }

  // Modificando a lógica de filtragem para setor
  if (filters.sector && filters.sector !== 'all') {
    const setorId = parseInt(filters.sector);
    logger.info(`Aplicando filtro de setor: ${setorId}`);
    query = query.eq('setor_id', setorId);
  }

  // Modificando a lógica de filtragem para tipo de refeição
  if (filters.mealType && filters.mealType !== 'all') {
    const tipoRefeicaoId = parseInt(filters.mealType);
    logger.info(`Aplicando filtro de tipo de refeição: ${tipoRefeicaoId}`);
    query = query.eq('tipo_refeicao_id', tipoRefeicaoId);
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