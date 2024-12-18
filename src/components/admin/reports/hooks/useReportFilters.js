import { useState } from 'react';
import { startOfMonth, endOfDay, isAfter, isBefore, parseISO } from 'date-fns';
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
    
    if (filterType === 'startDate') {
      const startDate = value instanceof Date ? value : parseISO(value);
      if (isAfter(startDate, filters.endDate)) {
        toast.error("Data inicial não pode ser maior que a data final");
        return;
      }
    }
    
    if (filterType === 'endDate') {
      const endDate = value instanceof Date ? value : parseISO(value);
      if (isBefore(endDate, filters.startDate)) {
        toast.error("Data final não pode ser menor que a data inicial");
        return;
      }
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