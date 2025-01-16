import { useState } from 'react';
import { startOfMonth, endOfDay, subDays } from 'date-fns';
import { toast } from "sonner";

export const useReportsTFilters = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: subDays(new Date(), 7), // Últimos 7 dias como padrão
    endDate: endOfDay(new Date()),
    shift: 'all',
    sector: 'all',
    mealType: 'all',
    voucherType: 'all'
  });

  const handleFilterChange = (filterType, value) => {
    try {
      console.log(`Alterando filtro ${filterType}:`, value);
      
      if (value === undefined || value === null) {
        console.warn(`Valor inválido para ${filterType}`);
        return;
      }

      setFilters(prev => {
        const newFilters = { ...prev, [filterType]: value };
        console.log('Novos filtros:', newFilters);
        return newFilters;
      });
    } catch (error) {
      console.error('Erro ao alterar filtro:', error);
      toast.error('Erro ao atualizar filtro');
    }
  };

  return { 
    filters, 
    handleFilterChange
  };
};