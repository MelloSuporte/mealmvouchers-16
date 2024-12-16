import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../config/supabase';
import { toast } from "sonner";

export const useReportMetrics = (filters) => {
  return useQuery({
    queryKey: ['report-metrics', filters],
    queryFn: async () => {
      console.log('Consultando métricas com filtros:', filters);

      let query = supabase
        .from('vw_uso_voucher_detalhado')
        .select('*');

      if (filters.company && filters.company !== 'all') {
        query = query.eq('empresa_uuid', filters.company);
      }
      
      if (filters.startDate) {
        query = query.gte('data_uso', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('data_uso', filters.endDate.toISOString());
      }

      if (filters.shift && filters.shift !== 'all') {
        query = query.eq('turno', filters.shift);
      }

      if (filters.mealType && filters.mealType !== 'all') {
        query = query.eq('tipo_refeicao', filters.mealType);
      }

      const { data: usageData, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }

      console.log('Dados brutos retornados:', usageData);

      // Se não houver dados, retornar objeto com valores zerados
      if (!usageData || usageData.length === 0) {
        return {
          totalCost: 0,
          averageCost: 0,
          regularVouchers: 0,
          disposableVouchers: 0,
          byCompany: {},
          byShift: {},
          byMealType: {},
          filteredData: []
        };
      }

      // Calcular métricas
      const totalCost = usageData.reduce((sum, item) => 
        sum + (parseFloat(item.valor) || 0), 0);
      
      const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;

      // Agrupar por empresa
      const byCompany = usageData.reduce((acc, curr) => {
        const empresa = curr.empresa || 'Não especificado';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por turno
      const byShift = usageData.reduce((acc, curr) => {
        const turno = curr.turno || 'Não especificado';
        acc[turno] = (acc[turno] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por tipo de refeição
      const byMealType = usageData.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCost,
        averageCost,
        regularVouchers: usageData.length,
        disposableVouchers: 0, // This would need to be calculated differently if needed
        byCompany,
        byShift,
        byMealType,
        filteredData: usageData
      };
    },
    retry: 1,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};