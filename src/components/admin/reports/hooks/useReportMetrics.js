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
        .from('uso_voucher')
        .select(`
          *,
          usuario:usuario_id(
            id,
            nome,
            cpf,
            empresa:empresa_id(
              id,
              nome
            ),
            turno:turno_id(
              id,
              tipo_turno
            )
          ),
          tipo_refeicao:tipo_refeicao_id(
            id,
            nome,
            valor
          )
        `);

      // Aplicar filtros
      if (filters.startDate) {
        query = query.gte('usado_em', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('usado_em', filters.endDate.toISOString());
      }
      if (filters.company && filters.company !== 'all') {
        query = query.eq('usuario.empresa.id', filters.company);
      }
      if (filters.shift && filters.shift !== 'all') {
        query = query.eq('usuario.turno.id', filters.shift);
      }
      if (filters.mealType && filters.mealType !== 'all') {
        query = query.eq('tipo_refeicao.id', filters.mealType);
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
        sum + (parseFloat(item.tipo_refeicao?.valor) || 0), 0);
      
      const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;
      
      const regularVouchers = usageData.filter(item => 
        item.tipo_voucher === 'comum').length;
      
      const disposableVouchers = usageData.filter(item => 
        item.tipo_voucher === 'descartavel').length;

      // Agrupar por empresa
      const byCompany = usageData.reduce((acc, curr) => {
        const empresa = curr.usuario?.empresa?.nome || 'Não especificado';
        acc[empresa] = (acc[empresa] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por turno
      const byShift = usageData.reduce((acc, curr) => {
        const turno = curr.usuario?.turno?.tipo_turno || 'Não especificado';
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
    },
    retry: 1,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};