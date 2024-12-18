import { useState } from 'react';
import { startOfMonth, endOfDay } from 'date-fns';
import { toast } from "sonner";

export const useReportFilters = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: startOfMonth(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    sector: 'all',
    mealType: 'all'
  });

  const handleFilterChange = (filterType, value) => {
    console.log('Alterando filtro:', filterType, 'para:', value);
    
    // Se o valor for undefined ou null, não atualiza o filtro
    if (value === undefined || value === null) {
      console.error(`Valor inválido para ${filterType}:`, value);
      return;
    }

    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: value
      };
      console.log('Novos filtros:', newFilters);
      return newFilters;
    });
  };

  return { 
    filters, 
    handleFilterChange
  };
};