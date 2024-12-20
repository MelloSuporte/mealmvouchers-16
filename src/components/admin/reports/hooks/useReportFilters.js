import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';

export const useReportFilters = () => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    company: 'all',
    companyName: '',
    shift: 'all',
    shiftName: '',
    sector: 'all',
    sectorName: '',
    mealType: 'all',
    mealTypeName: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    empresas: [],
    turnos: [],
    setores: [],
    tiposRefeicao: []
  });

  useEffect(() => {
    const loadFilterOptions = async () => {
      console.log('Iniciando busca de opções de filtro...');
      try {
        // Buscar empresas
        const { data: empresas, error: empresasError } = await supabase
          .from('empresas')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (empresasError) throw empresasError;
        console.log('[INFO]', empresas?.length || 0, 'empresas encontradas');

        // Buscar setores
        console.log('[INFO] Iniciando busca de setores...');
        const { data: setores, error: setoresError } = await supabase
          .from('setores')
          .select('id, nome_setor')
          .eq('ativo', true)
          .order('nome_setor');

        if (setoresError) throw setoresError;
        console.log('[INFO]', setores?.length || 0, 'setores encontrados');

        // Buscar turnos
        console.log('[INFO] Buscando turnos ativos...');
        const { data: turnos, error: turnosError } = await supabase
          .from('turnos')
          .select('id, tipo_turno')
          .eq('ativo', true)
          .order('tipo_turno');

        if (turnosError) throw turnosError;
        console.log('[INFO]', turnos?.length || 0, 'turnos encontrados');

        // Buscar tipos de refeição
        const { data: tiposRefeicao, error: tiposRefeicaoError } = await supabase
          .from('tipos_refeicao')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (tiposRefeicaoError) throw tiposRefeicaoError;
        console.log('[INFO]', tiposRefeicao?.length || 0, 'tipos de refeição encontrados');

        setFilterOptions({
          empresas: empresas || [],
          turnos: turnos || [],
          setores: setores || [],
          tiposRefeicao: tiposRefeicao || []
        });

        console.log('Dados dos filtros carregados com sucesso:', {
          empresas,
          turnos,
          setores,
          tiposRefeicao
        });

      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (filterName, value, displayName = '') => {
    console.log('Alterando filtro:', { filterName, value, displayName });
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      [`${filterName}Name`]: displayName
    }));
  };

  return {
    filters,
    handleFilterChange,
    filterOptions
  };
};