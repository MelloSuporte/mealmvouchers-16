import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        logger.info('Verificando sessão do usuário...');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          logger.warn('Usuário não autenticado, mas continuando a busca...');
        }

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas');
          return [];
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

        logger.info('Construindo query base...');
        let query = supabase
          .from('uso_voucher')  // Changed from vw_uso_voucher_detalhado to uso_voucher
          .select(`
            *,
            usuarios (
              id,
              nome,
              cpf,
              empresa:empresas (
                id,
                nome
              ),
              turno:turnos (
                tipo_turno
              ),
              setor:setores (
                id,
                nome_setor
              )
            ),
            tipo_refeicao:tipos_refeicao (
              nome,
              valor
            )
          `)
          .gte('usado_em', startUtc)
          .lte('usado_em', endUtc);

        if (filters.company && filters.company !== 'all') {
          logger.info(`Filtrando por empresa: ${filters.company}`);
          query = query.eq('usuarios.empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          logger.info(`Filtrando por turno: ${filters.shift}`);
          query = query.eq('usuarios.turno_id', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          logger.info(`Filtrando por setor: ${filters.sector}`);
          query = query.eq('usuarios.setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          logger.info(`Filtrando por tipo refeição: ${filters.mealType}`);
          query = query.eq('tipo_refeicao_id', filters.mealType);
        }

        logger.info('Executando query...');
        const { data, error } = await query;

        if (error) {
          logger.error('Erro detalhado na consulta:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status: error.status,
            statusText: error.statusText
          });
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        // Transform data to match the view structure
        const transformedData = data?.map(record => ({
          id: record.id,
          data_uso: record.usado_em,
          usuario_id: record.usuarios?.id,
          nome_usuario: record.usuarios?.nome,
          cpf: record.usuarios?.cpf,
          empresa_id: record.usuarios?.empresa?.id,
          nome_empresa: record.usuarios?.empresa?.nome,
          turno: record.usuarios?.turno?.tipo_turno,
          setor_id: record.usuarios?.setor?.id,
          nome_setor: record.usuarios?.setor?.nome_setor,
          tipo_refeicao: record.tipo_refeicao?.nome,
          valor_refeicao: record.tipo_refeicao?.valor,
          observacao: record.observacao,
          created_at: record.created_at
        })) || [];

        logger.info('Dados retornados:', {
          totalRegistros: transformedData?.length || 0,
          primeiroRegistro: transformedData?.[0],
          ultimoRegistro: transformedData?.[transformedData?.length - 1]
        });

        return transformedData;
      } catch (error) {
        logger.error('Erro detalhado ao buscar dados:', {
          name: error.name,
          message: error.message,
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