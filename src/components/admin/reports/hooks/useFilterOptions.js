import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      try {
        // Buscar empresas ativas
        const { data: empresas, error: empresasError } = await supabase
          .from('empresas')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (empresasError) throw empresasError;

        // Buscar turnos ativos
        const { data: turnos, error: turnosError } = await supabase
          .from('turnos')
          .select('id, tipo_turno')
          .eq('ativo', true)
          .order('tipo_turno');

        if (turnosError) throw turnosError;

        // Buscar tipos de refeição ativos
        const { data: tiposRefeicao, error: tiposError } = await supabase
          .from('tipos_refeicao')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (tiposError) throw tiposError;

        return {
          empresas: empresas || [],
          turnos: turnos || [],
          tiposRefeicao: tiposRefeicao || []
        };
      } catch (error) {
        console.error('Erro ao buscar opções dos filtros:', error);
        toast.error('Erro ao carregar opções dos filtros');
        throw error;
      }
    }
  });
};