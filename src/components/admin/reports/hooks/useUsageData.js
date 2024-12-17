import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de dados com filtros:', filters);
        
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*');

        console.log('Query base criada');

        // Aplicar filtros somente se não forem 'all' ou undefined
        if (filters.company && filters.company !== 'all') {
          console.log('Aplicando filtro de empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          console.log('Aplicando filtro de data inicial:', startDate.toISOString());
          query = query.gte('data_uso', startDate.toISOString());
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          console.log('Aplicando filtro de data final:', endDate.toISOString());
          query = query.lte('data_uso', endDate.toISOString());
        }

        if (filters.shift && filters.shift !== 'all') {
          console.log('Aplicando filtro de turno:', filters.shift);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          console.log('Aplicando filtro de setor:', filters.sector);
          query = query.eq('nome_setor', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Aplicando filtro de tipo de refeição:', filters.mealType);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao carregar dados');
          throw error;
        }

        console.log('Dados retornados:', data);
        
        if (data && data.length > 0) {
          console.log('Primeiro registro:', data[0]);
          console.log('Campos disponíveis:', Object.keys(data[0]));
          console.log('Total de registros:', data.length);
        } else {
          console.log('Nenhum dado encontrado com os filtros aplicados');
        }

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000
  });
};