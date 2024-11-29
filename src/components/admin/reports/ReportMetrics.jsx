import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '../../../config/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';

const ReportMetrics = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    day: 'all',
    shift: 'all',
    mealType: 'all'
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['report-metrics', filters],
    queryFn: async () => {
      const { data: usageData, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*');

      if (error) throw error;

      // Filtra os dados baseado nos filtros selecionados
      const filteredData = usageData.filter(item => {
        if (filters.company !== 'all' && item.empresa !== filters.company) return false;
        if (filters.day !== 'all' && format(new Date(item.usado_em), 'dd/MM/yyyy', { locale: ptBR }) !== filters.day) return false;
        if (filters.shift !== 'all' && item.turno !== filters.shift) return false;
        if (filters.mealType !== 'all' && item.tipo_refeicao !== filters.mealType) return false;
        return true;
      });

      const totalCost = filteredData.reduce((sum, item) => sum + (item.valor_refeicao || 0), 0);
      const averageCost = totalCost / (filteredData.length || 1);
      
      const regularVouchers = filteredData.filter(item => !item.voucher?.startsWith('TEMP')).length;
      const disposableVouchers = filteredData.filter(item => item.voucher?.startsWith('TEMP')).length;

      // Segmentação por Empresa
      const byCompany = usageData.reduce((acc, item) => {
        const company = item.empresa || 'Não especificada';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Dia
      const byDay = usageData.reduce((acc, item) => {
        const day = format(new Date(item.usado_em), 'dd/MM/yyyy', { locale: ptBR });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Turno
      const byShift = usageData.reduce((acc, item) => {
        const shift = item.turno || 'Não especificado';
        acc[shift] = (acc[shift] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Tipo de Refeição
      const byMealType = usageData.reduce((acc, item) => {
        const mealType = item.tipo_refeicao || 'Não especificado';
        acc[mealType] = (acc[mealType] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCost,
        averageCost,
        regularVouchers,
        disposableVouchers,
        byCompany,
        byDay,
        byShift,
        byMealType
      };
    }
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportFilters metrics={metrics} onFilterChange={handleFilterChange} />
      <MetricsCards metrics={metrics} />
    </div>
  );
};

export default ReportMetrics;