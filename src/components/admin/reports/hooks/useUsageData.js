import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import { format } from 'date-fns';

const buildQuery = (filters) => {
  console.log('Construindo query com filtros:', JSON.stringify(filters, null, 2));
  
  let query = supabase
    .from('relatorio_uso_voucher')
    .select('*')
    .order('data_uso', { ascending: false });

  if (filters.startDate) {
    const formattedStartDate = format(new Date(filters.startDate), "yyyy-MM-dd'T'00:00:00'Z'");
    query = query.gte('data_uso', formattedStartDate);
    console.log('Filtro data inicial:', formattedStartDate);
  }

  if (filters.endDate) {
    const formattedEndDate = format(new Date(filters.endDate), "yyyy-MM-dd'T'23:59:59.999'Z'");
    query = query.lte('data_uso', formattedEndDate);
    console.log('Filtro data final:', formattedEndDate);
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
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        if (data?.length === 0) {
          console.log('Nenhum registro encontrado com os filtros aplicados');
        } else {
          console.log('Primeiro registro:', data[0]);
        }

        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        toast.error('Erro ao carregar dados do relatório. Por favor, tente novamente.');
        throw error;
      }
    },
    retry: 1,
    staleTime: 0, // Desabilita o cache para sempre buscar dados frescos
    refetchOnWindowFocus: false,
  });
};