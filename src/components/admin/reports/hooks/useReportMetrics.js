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
        .select('*')
        .gte('data_uso', filters.startDate.toISOString())
        .lte('data_uso', filters.endDate.toISOString());

      if (filters.company !== 'all') {
        query = query.eq('empresa', filters.company);
      }
      if (filters.shift !== 'all') {
        query = query.eq('turno', filters.shift);
      }
      if (filters.mealType !== 'all') {
        query = query.eq('tipo_refeicao', filters.mealType);
      }

      const { data: usageData, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }

      console.log('Dados brutos retornados:', usageData);

      const totalCost = usageData.reduce((sum, item) => 
        sum + (parseFloat(item.valor_refeicao) || 0), 0);
      
      const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;
      
      const regularVouchers = usageData.filter(item => 
        item.tipo_voucher === 'comum').length;
      
      const disposableVouchers = usageData.filter(item => 
        item.tipo_voucher === 'descartavel').length;

      const byCompany = usageData.reduce((acc, curr) => {
        const empresa = curr.empresa || 'Não especificado';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {});

      const byShift = usageData.reduce((acc, curr) => {
        const turno = curr.turno || 'Não especificado';
        acc[turno] = (acc[turno] || 0) + 1;
        return acc;
      }, {});

      const byMealType = usageData.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCost,
        averageCost,
        regularVouchers,
        disposableVouchers,
        byCompany,
        byShift,
        byMealType,
        filteredData: usageData
      };
    }
  });
};