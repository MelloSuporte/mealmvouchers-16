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
          throw new Error(`Erro ao buscar empresas: ${empresasError.message}`);
        }
        console.log('[INFO]', empresas?.length, 'empresas encontradas');

        // Buscar turnos ativos
        const { data: turnos, error: turnosError } = await supabase
          .from('turnos')
          .select('id, tipo_turno')
          .eq('ativo', true)
          .order('tipo_turno');

        if (turnosError) {
          console.error('Erro ao buscar turnos:', turnosError);
          throw new Error(`Erro ao buscar turnos: ${turnosError.message}`);
        }
        console.log('[INFO]', turnos?.length, 'turnos encontrados');

        // Buscar setores ativos
        const { data: setores, error: setoresError } = await supabase
          .from('setores')
          .select('id, nome_setor')
          .eq('ativo', true)
          .order('nome_setor');

        if (setoresError) {
          console.error('Erro ao buscar setores:', setoresError);
          throw new Error(`Erro ao buscar setores: ${setoresError.message}`);
        }
        console.log('[INFO]', setores?.length, 'setores encontrados');

        // Buscar tipos de refeição ativos
        const { data: tiposRefeicao, error: tiposError } = await supabase
          .from('tipos_refeicao')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (tiposError) {
          console.error('Erro ao buscar tipos de refeição:', tiposError);
          throw new Error(`Erro ao buscar tipos de refeição: ${tiposError.message}`);
        }
        console.log('[INFO]', tiposRefeicao?.length, 'tipos de refeição encontrados');

        const result = {
          empresas: empresas || [],
          turnos: turnos || [],
          setores: setores || [],
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