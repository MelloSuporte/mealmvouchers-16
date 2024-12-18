import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

const buildQuery = (filters) => {
  console.log('Construindo query com filtros:', filters);
  
  let query = supabase
    .from('relatorio_uso_voucher')
    .select(`
      id,
      data_uso,
      usuario_id,
      nome_usuario,
      cpf,
      empresa_id,
      nome_empresa,
      turno,
      setor_id,
      nome_setor,
      tipo_refeicao,
      valor,
      observacao
    `)
    .order('data_uso', { ascending: false });

  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    query = query.gte('data_uso', startDate.toISOString());
    console.log('Filtro data inicial:', startDate.toISOString());
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setUTCHours(23, 59, 59, 999);
    query = query.lte('data_uso', endDate.toISOString());
    console.log('Filtro data final:', endDate.toISOString());
  }

  if (filters.company && filters.company !== 'all') {
    query = query.eq('empresa_id', filters.company);
    console.log('Filtro empresa:', filters.company);
  }

  if (filters.shift && filters.shift !== 'all') {
    query = query.eq('turno', filters.shift);
    console.log('Filtro turno:', filters.shift);
  }

  if (filters.sector && filters.sector !== 'all') {
    query = query.eq('setor_id', filters.sector);
    console.log('Filtro setor:', filters.sector);
  }

  if (filters.mealType && filters.mealType !== 'all') {
    query = query.eq('tipo_refeicao', filters.mealType);
    console.log('Filtro tipo refeição:', filters.mealType);
  }

  return query;
};

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de dados com filtros:', JSON.stringify(filters, null, 2));
        
        const query = buildQuery(filters);
        const { data, error } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        toast.error('Erro ao carregar dados do relatório. Por favor, tente novamente.');
        throw error;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error) => {
        console.error('Erro detalhado na query:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Erro ao carregar dados: ${error.message}`);
      }
    }
  });
};