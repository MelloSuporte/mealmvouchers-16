import { useState } from 'react';
import { startOfMonth, endOfDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from "sonner";

export const useReportFilters = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    companyName: '',
    startDate: startOfMonth(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    shiftName: '',
    sector: 'all',
    sectorName: '',
    mealType: 'all',
    mealTypeName: ''
  });

  const handleFilterChange = (filterType, value, itemName = '') => {
    try {
      console.log(`Alterando filtro ${filterType}:`, value);
      
      if (value === undefined || value === null) {
        console.warn(`Valor inválido para ${filterType}`);
        return;
      }

      // Validação específica para datas
      if (filterType === 'startDate' || filterType === 'endDate') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.error('Data inválida:', value);
          toast.error('Data inválida');
          return;
        }

        // Ajusta para início/fim do dia
        const adjustedDate = filterType === 'startDate' 
          ? startOfDay(date)
          : endOfDay(date);

        // Validações adicionais para datas
        if (filterType === 'startDate' && filters.endDate && isAfter(adjustedDate, filters.endDate)) {
          toast.error('Data inicial não pode ser maior que a data final');
          return;
        }

        if (filterType === 'endDate' && filters.startDate && isBefore(adjustedDate, filters.startDate)) {
          toast.error('Data final não pode ser menor que a data inicial');
          return;
        }

        value = adjustedDate;
      }

      setFilters(prev => {
        const newFilters = { 
          ...prev, 
          [filterType]: value,
          // Adiciona o nome do item quando relevante
          ...(filterType === 'company' && { companyName: itemName }),
          ...(filterType === 'shift' && { shiftName: itemName }),
          ...(filterType === 'sector' && { sectorName: itemName }),
          ...(filterType === 'mealType' && { mealTypeName: itemName })
        };
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