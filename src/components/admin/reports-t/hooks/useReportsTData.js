import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { toast } from "sonner";

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca com filtros:', filters);
        
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        // Primeiro, vamos verificar se há dados na tabela
        const { count, error: countError } = await supabase
          .from('relatorio_uso_voucher')
          .select('*', { count: 'exact', head: true });

        console.log('Total de registros na tabela:', count);

        if (countError) {
          console.error('Erro ao verificar registros:', countError);
          throw countError;
        }

        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*');

        // Ajusta o fuso horário para UTC
        const timeZone = 'America/Sao_Paulo';
        const start = zonedTimeToUtc(startOfDay(new Date(filters.startDate)), timeZone);
        const end = zonedTimeToUtc(endOfDay(new Date(filters.endDate)), timeZone);
        
        console.log('Data início (local):', filters.startDate);
        console.log('Data fim (local):', filters.endDate);
        console.log('Data início (UTC):', start.toISOString());
        console.log('Data fim (UTC):', end.toISOString());
        
        // Adiciona filtros de data
        query = query
          .gte('data_uso', start.toISOString())
          .lte('data_uso', end.toISOString());

        if (filters.company && filters.company !== 'all') {
          console.log('Filtrando por empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          console.log('Filtrando por turno:', filters.shift);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          console.log('Filtrando por setor:', filters.sector);
          query = query.eq('setor_id', parseInt(filters.sector));
        }

        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Filtrando por tipo refeição:', filters.mealType);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        // Ordenar por data de uso
        query = query.order('data_uso', { ascending: false });

        console.log('Query final:', query);
        
        // Executar a query
        const { data, error } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        if (data) {
          console.log(`Encontrados ${data.length} registros após aplicar filtros`);
          console.log('Primeiros registros:', data.slice(0, 3));
        } else {
          console.log('Nenhum registro encontrado com os filtros aplicados');
          toast.warning('Nenhum registro encontrado para o período selecionado');
        }

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Falha ao carregar dados: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 0, // Não manter cache
    refetchOnWindowFocus: false,
  });
};