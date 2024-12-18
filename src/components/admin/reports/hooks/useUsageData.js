import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados de uso com filtros:', filters);
        
        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*')
          .order('data_uso', { ascending: false });

        // Filtro de data
        if (filters.startDate && filters.endDate) {
          const start = filters.startDate;
          const end = filters.endDate;
          
          console.log('Aplicando filtro de data:', {
            start: start.toISOString(),
            end: end.toISOString()
          });
          
          query = query
            .gte('data_uso', start.toISOString())
            .lte('data_uso', end.toISOString());
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

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }
    }
  });
};