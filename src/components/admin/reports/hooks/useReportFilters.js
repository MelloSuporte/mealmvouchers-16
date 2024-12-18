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
    
    if (filterType === 'startDate' && value > filters.endDate) {
      toast.error("Data inicial não pode ser maior que a data final");
      return;
    }
    
    if (filterType === 'endDate' && value < filters.startDate) {
      toast.error("Data final não pode ser menor que a data inicial");
      return;
    }

    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return { 
    filters, 
    handleFilterChange
  };
};