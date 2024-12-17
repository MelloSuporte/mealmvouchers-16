import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados de uso com filtros:', filters);
        
        let query = supabase
          .from('uso_voucher')
          .select(`
            *,
            usuarios!uso_voucher_usuario_id_fkey (
              id,
              nome,
              cpf,
              setor_id,
              empresa:empresas (
                id,
                nome
              ),
              turno:turnos (
                tipo_turno
              )
            ),
            tipo_refeicao:tipos_refeicao (
              nome,
              valor
            )
          `);

        if (filters.company && filters.company !== 'all') {
          query = query.eq('usuarios.empresa.id', filters.company);
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setUTCHours(0, 0, 0, 0);
          query = query.gte('usado_em', startDate.toISOString());
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setUTCHours(23, 59, 59, 999);
          query = query.lte('usado_em', endDate.toISOString());
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('usuarios.turno.id', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('usuarios.setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          query = query.eq('tipo_refeicao.id', filters.mealType);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar dados:', error);
          throw error;
        }

        const transformedData = data.map(item => ({
          id: item.id,
          usado_em: item.usado_em,
          nome_usuario: item.usuarios?.nome,
          cpf: item.usuarios?.cpf,
          empresa: item.usuarios?.empresa?.nome,
          tipo_refeicao: item.tipo_refeicao?.nome,
          valor: item.tipo_refeicao?.valor,
          turno: item.usuarios?.turno?.tipo_turno,
          setor_id: item.usuarios?.setor_id
        }));

        console.log('Dados transformados:', transformedData);
        return transformedData || [];
      } catch (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
  });
};