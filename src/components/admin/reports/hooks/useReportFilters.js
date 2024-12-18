import { useState } from 'react';
import { startOfMonth, endOfDay, isAfter, isBefore } from 'date-fns';
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
      // Garantir que value é uma data válida
      const startDate = value instanceof Date ? value : new Date(value);
      if (isNaN(startDate.getTime())) {
        console.error('Data inicial inválida:', value);
        toast.error("Data inicial inválida");
        return;
      }
      if (isAfter(startDate, filters.endDate)) {
        toast.error("Data inicial não pode ser maior que a data final");
        return;
      }
      value = startDate;
    }
    
    if (filterType === 'endDate') {
      // Garantir que value é uma data válida
      const endDate = value instanceof Date ? value : new Date(value);
      if (isNaN(endDate.getTime())) {
        console.error('Data final inválida:', value);
        toast.error("Data final inválida");
        return;
      }
      if (isBefore(endDate, filters.startDate)) {
        toast.error("Data final não pode ser menor que a data inicial");
        return;
      }
      value = endDate;
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