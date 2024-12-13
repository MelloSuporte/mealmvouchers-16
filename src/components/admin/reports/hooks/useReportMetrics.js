import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../config/supabase';
import { toast } from "sonner";

export const useReportMetrics = (filters) => {
  return useQuery({
    queryKey: ['report-metrics', filters],
    queryFn: async () => {
      console.log('Consultando métricas com filtros:', filters);

      // Base query para uso_voucher com joins necessários
      let query = supabase
        .from('vw_uso_voucher_detalhado')
        .select(`
          *,
          usuarios (
            id,
            nome,
            cpf,
            empresa_id,
            turno_id
          ),
          tipos_refeicao (
            id,
            nome,
            valor
          ),
          empresas (
            id,
            nome
          ),
          turnos (
            id,
            tipo_turno
          )
        `);

      // Aplicar filtros
      if (filters.startDate) {
        query = query.gte('usado_em', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('usado_em', filters.endDate.toISOString());
      }
      if (filters.company !== 'all') {
        query = query.eq('empresa_id', filters.company);
      }
      if (filters.shift !== 'all') {
        query = query.eq('turno_id', filters.shift);
      }
      if (filters.mealType !== 'all') {
        query = query.eq('tipo_refeicao_id', filters.mealType);
      }

      const { data: usageData, error } = await query;

      if (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }

      console.log('Dados brutos retornados:', usageData);

      // Calcular métricas
      const totalCost = usageData.reduce((sum, item) => 
        sum + (parseFloat(item.valor_refeicao) || 0), 0);
      
      const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;
      
      const regularVouchers = usageData.filter(item => 
        item.tipo_voucher === 'comum').length;
      
      const disposableVouchers = usageData.filter(item => 
        item.tipo_voucher === 'descartavel').length;

      // Agrupar por empresa
      const byCompany = usageData.reduce((acc, curr) => {
        const empresa = curr.empresa?.nome || 'Não especificado';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por turno
      const byShift = usageData.reduce((acc, curr) => {
        const turno = curr.turno?.tipo_turno || 'Não especificado';
        acc[turno] = (acc[turno] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por tipo de refeição
      const byMealType = usageData.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao?.nome || 'Não especificado';
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