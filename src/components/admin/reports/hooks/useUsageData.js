import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Verificando sessão do usuário...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          throw new Error('Falha ao verificar autenticação');
        }

        if (!session) {
          console.error('Nenhuma sessão encontrada');
          throw new Error('Usuário não autenticado');
        }

        console.log('Detalhes da sessão:', {
          userId: session?.user?.id,
          role: session?.user?.role,
          email: session?.user?.email,
          aud: session?.user?.aud,
          exp: session?.expires_at
        });
        
        console.log('Iniciando busca com filtros:', filters);
        
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        
        console.log('Data início formatada:', startUtc);
        console.log('Data fim formatada:', endUtc);

        console.log('Construindo query base...');
        let query = supabase
          .from('uso_voucher')
          .select(`
            id,
            usado_em,
            usuarios!uso_voucher_usuario_id_fkey (
              id,
              nome,
              cpf,
              empresa_id,
              turno_id,
              setor_id
            ),
            tipos_refeicao!inner (
              id,
              nome,
              valor
            )
          `)
          .gte('usado_em', startUtc)
          .lte('usado_em', endUtc);

        console.log('Query base construída:', {
          query: query.toString(),
          headers: query.headers,
          auth: session?.access_token
        });

        if (filters.company && filters.company !== 'all') {
          console.log('Filtrando por empresa:', filters.company);
          query = query.eq('usuarios.empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          console.log('Filtrando por turno:', filters.shift);
          query = query.eq('usuarios.turno_id', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          console.log('Filtrando por setor:', filters.sector);
          query = query.eq('usuarios.setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Filtrando por tipo refeição:', filters.mealType);
          query = query.eq('tipo_refeicao_id', filters.mealType);
        }

        console.log('Executando query final...');
        const { data, error, status, statusText } = await query;

        if (error) {
          console.error('Erro detalhado na consulta:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status: status,
            statusText: statusText,
            auth: session?.access_token ? 'Token presente' : 'Token ausente'
          });
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        console.log(`Encontrados ${data?.length || 0} registros`);
        if (data?.length > 0) {
          console.log('Amostra dos dados:', {
            primeiroRegistro: data[0],
            ultimoRegistro: data[data.length - 1],
            totalRegistros: data.length
          });
        } else {
          console.log('Nenhum registro encontrado com os filtros aplicados');
          console.log('Verificando políticas RLS ativas:', {
            table: 'uso_voucher',
            userRole: session?.user?.role,
            userId: session?.user?.id
          });
          toast.warning('Nenhum registro encontrado para o período selecionado. Tente ajustar os filtros.');
        }

        return data || [];
      } catch (error) {
        console.error('Erro detalhado ao buscar dados:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        });
        toast.error('Falha ao carregar dados: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
};