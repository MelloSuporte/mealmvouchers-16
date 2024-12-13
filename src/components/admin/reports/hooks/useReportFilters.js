import { useState } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from "sonner";
import { supabase } from '../../../../config/supabase';

export const useReportFilters = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    mealType: 'all'
  });

  // Função para buscar dados iniciais dos filtros
  const fetchFilterOptions = async () => {
    try {
      // Buscar empresas ativas
      const { data: empresas } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true);

      // Buscar turnos ativos
      const { data: turnos } = await supabase
        .from('turnos')
        .select('id, tipo_turno')
        .eq('ativo', true);

      // Buscar tipos de refeição ativos
      const { data: tiposRefeicao } = await supabase
        .from('tipos_refeicao')
        .select('id, nome')
        .eq('ativo', true);

      return {
        empresas: empresas || [],
        turnos: turnos || [],
        tiposRefeicao: tiposRefeicao || []
      };
    } catch (error) {
      console.error('Erro ao buscar opções dos filtros:', error);
      toast.error('Erro ao carregar opções dos filtros');
      return {
        empresas: [],
        turnos: [],
        tiposRefeicao: []
      };
    }
  };

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
    handleFilterChange,
    fetchFilterOptions 
  };
};