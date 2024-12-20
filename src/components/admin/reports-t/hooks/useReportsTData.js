import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

const checkRecords = async () => {
  const { count, error } = await supabase
    .from('uso_voucher')  // Alterado de uso_voucher_backup para uso_voucher
    .select('*', { count: 'exact', head: true });

  if (error) {
    logger.error('Erro ao verificar registros na tabela:', {
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else {
    logger.info(`Total de registros na tabela uso_voucher: ${count}`);
  }

  return count;
};

const mapData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.usado_em,
    usuario_id: item.usuario_id,
    nome_usuario: item.nome_usuario || 'Usuário Teste',
    cpf: item.cpf || '000.000.000-00',
    empresa: item.empresa_id,
    nome_empresa: item.nome_empresa || 'Empresa Teste',
    turno: item.turno || 'Turno Teste',
    setor_id: item.setor_id || 1,
    nome_setor: item.nome_setor || 'Setor Teste',
    tipo_refeicao: item.tipo_refeicao || 'Não especificado',
    valor_refeicao: item.valor_refeicao || 0,
    observacao: item.observacao
  })) || [];
};

const fetchAllData = async () => {
  const { data, error } = await supabase
    .from('uso_voucher')  // Alterado de uso_voucher_backup para uso_voucher
    .select(`
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
    `)
    .order('usado_em', { ascending: false })
    .limit(100);

  if (error) throw error;

  logger.info(`Busca sem filtros de data retornou ${data?.length || 0} registros`);
  return mapData(data);
};

const fetchFilteredData = async (startUtc, endUtc, filters) => {
  let query = supabase
    .from('uso_voucher')  // Alterado de uso_voucher_backup para uso_voucher
    .select(`
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
    `)
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
  return mapData(data);
};

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados do relatório com filtros:', filters);

        await checkRecords();

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório');
          return fetchAllData();
        }

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
        logger.error('Erro ao buscar dados do relatório:', {
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