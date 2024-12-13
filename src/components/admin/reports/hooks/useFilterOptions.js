import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de opções de filtro...');

        // Buscar empresas ativas
        const { data: empresas, error: empresasError } = await supabase
          .from('empresas')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (empresasError) {
          console.error('Erro ao buscar empresas:', empresasError);
          throw empresasError;
        }
        console.log('Empresas encontradas:', empresas?.length || 0);

        // Buscar turnos ativos
        const { data: turnos, error: turnosError } = await supabase
          .from('turnos')
          .select('id, tipo_turno')
          .eq('ativo', true)
          .order('tipo_turno');

        if (turnosError) {
          console.error('Erro ao buscar turnos:', turnosError);
          throw turnosError;
        }
        console.log('Turnos encontrados:', turnos?.length || 0);

        // Buscar tipos de refeição ativos
        const { data: tiposRefeicao, error: tiposError } = await supabase
          .from('tipos_refeicao')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (tiposError) {
          console.error('Erro ao buscar tipos de refeição:', tiposError);
          throw tiposError;
        }
        console.log('Tipos de refeição encontrados:', tiposRefeicao?.length || 0);

        // Verificar se alguma das listas está vazia
        if (!empresas?.length) {
          console.warn('Nenhuma empresa ativa encontrada');
        }
        if (!turnos?.length) {
          console.warn('Nenhum turno ativo encontrado');
        }
        if (!tiposRefeicao?.length) {
          console.warn('Nenhum tipo de refeição ativo encontrado');
        }

        const result = {
          empresas: empresas || [],
          turnos: turnos || [],
          tiposRefeicao: tiposRefeicao || []
        };

        console.log('Dados dos filtros carregados com sucesso:', result);
        return result;

      } catch (error) {
        console.error('Erro ao buscar opções dos filtros:', error);
        toast.error('Erro ao carregar opções dos filtros. Detalhes: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};