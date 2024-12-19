import { useState } from 'react';
import { startOfMonth, endOfDay } from 'date-fns';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useReportData = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    companyName: 'Todas as Empresas',
    startDate: startOfMonth(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    shiftName: 'Todos os Turnos',
    sector: 'all',
    sectorName: 'Todos os Setores',
    mealType: 'all',
    mealTypeName: 'Todos os Tipos'
  });

  const handleFilterChange = (filterType, value, itemName = '') => {
    try {
      logger.info(`Alterando filtro ${filterType}:`, { value, itemName });
      
      if (value === undefined || value === null) {
        logger.warn(`Valor inválido para ${filterType}`);
        return;
      }

      setFilters(prev => {
        const newFilters = { 
          ...prev, 
          [filterType]: value,
          ...(filterType === 'company' && { companyName: itemName || 'Todas as Empresas' }),
          ...(filterType === 'shift' && { shiftName: itemName || 'Todos os Turnos' }),
          ...(filterType === 'sector' && { sectorName: itemName || 'Todos os Setores' }),
          ...(filterType === 'mealType' && { mealTypeName: itemName || 'Todos os Tipos' })
        };
        logger.info('Novos filtros:', newFilters);
        return newFilters;
      });
    } catch (error) {
      logger.error('Erro ao alterar filtro:', error);
      toast.error('Erro ao atualizar filtro');
    }
  };

  return { 
    filters, 
    handleFilterChange
  };
};