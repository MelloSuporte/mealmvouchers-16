import { supabase } from '@/config/supabase';
import { mapVoucherData } from './dataMappers';
import logger from '@/config/logger';
import { toast } from "sonner";

const baseSelect = `
  *,
  usuarios (
    nome,
    cpf,
    empresa_id,
    turno_id,
    setor_id
  ),
  tipos_refeicao (
    nome,
    valor
  )
`;

export const fetchAllVoucherData = async () => {
  const { data, error } = await supabase
    .from('uso_voucher')
    .select(baseSelect)
    .order('usado_em', { ascending: false })
    .limit(100);

  if (error) throw error;

  logger.info(`Busca sem filtros de data retornou ${data?.length || 0} registros`);
  return mapVoucherData(data);
};

export const fetchFilteredVoucherData = async (startUtc, endUtc, filters) => {
  let query = supabase
    .from('uso_voucher')
    .select(baseSelect)
    .gte('usado_em', startUtc)
    .lte('usado_em', endUtc);

  if (filters.company && filters.company !== 'all') {
    logger.info(`Aplicando filtro de empresa: ${filters.company}`);
    query = query.eq('usuarios.empresa_id', filters.company);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Erro na consulta do relatório:', {
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
  return mapVoucherData(data);
};