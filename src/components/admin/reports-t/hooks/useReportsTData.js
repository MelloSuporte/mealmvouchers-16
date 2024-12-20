import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        
        console.log('Iniciando consulta com filtros:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        let query = supabase
          .from('uso_voucher')
          .select(`
            id,
            usado_em,
            tipo_voucher,
            codigo,
            data_criacao,
            data_uso,
            data_expiracao,
            usado,
            usuarios!uso_voucher_usuario_id_fkey (
              id,
              nome,
              cpf,
              empresa_id,
              turno_id,
              setor_id
            ),
            tipos_refeicao!inner (
              id,
              nome,
              valor
            )
          `)
          .gte('usado_em', startUtc)
          .lte('usado_em', endUtc);

        if (filters.company && filters.company !== 'all') {
          query = query.eq('usuarios.empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('usuarios.turno_id', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('usuarios.setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          query = query.eq('tipo_refeicao_id', filters.mealType);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        console.log(`Dados retornados da consulta:`, data);
        
        if (!data || data.length === 0) {
          console.log('Nenhum registro encontrado com os filtros aplicados');
          return [];
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
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