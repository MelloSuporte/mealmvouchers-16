import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados de uso com filtros:', filters);
        
        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*');

        // Filtro de data
        if (filters.startDate && filters.endDate) {
          console.log('Aplicando filtro de data:', {
            start: filters.startDate,
            end: filters.endDate
          });
          
          query = query
            .gte('data_uso', filters.startDate)
            .lte('data_uso', filters.endDate);
        }

        // Filtro de empresa
        if (filters.company && filters.company !== 'all') {
          console.log('Aplicando filtro de empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }

        // Filtro de turno
        if (filters.shift && filters.shift !== 'all') {
          console.log('Aplicando filtro de turno:', filters.shift);
          query = query.eq('turno', filters.shift);
        }

        // Filtro de setor
        if (filters.sector && filters.sector !== 'all') {
          console.log('Aplicando filtro de setor:', filters.sector);
          query = query.eq('setor_id', filters.sector);
        }

        // Filtro de tipo de refeição
        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Aplicando filtro de tipo de refeição:', filters.mealType);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        console.log('Query final:', query);
        
        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar dados:', error);
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        throw error;
      }
    },
    enabled: !!filters
  });
};