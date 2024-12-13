import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

export const useChartData = (tiposRefeicao) => {
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-data'],
    queryFn: async () => {
      const startDate = startOfWeek(new Date(), { locale: ptBR });
      const endDate = endOfWeek(new Date(), { locale: ptBR });

      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .gte('data_uso', startDate.toISOString())
        .lte('data_uso', endDate.toISOString());

      if (error) {
        console.error('Erro ao buscar dados semanais:', error);
        toast.error('Erro ao carregar dados semanais');
        throw error;
      }

      const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      
      const dadosPorDia = diasDaSemana.map(dia => {
        const diaObj = { dia };
        if (tiposRefeicao) {
          tiposRefeicao.forEach(tipo => {
            diaObj[tipo] = 0;
          });
        }
        return diaObj;
      });

      if (data && data.length > 0) {
        data.forEach(registro => {
          if (registro.data_uso && registro.tipo_refeicao) {
            const dataUso = new Date(registro.data_uso);
            const diaSemana = format(dataUso, 'EEEE', { locale: ptBR });
            const indexDia = diasDaSemana.indexOf(diaSemana);
            
            if (indexDia !== -1) {
              dadosPorDia[indexDia][registro.tipo_refeicao] = 
                (dadosPorDia[indexDia][registro.tipo_refeicao] || 0) + 1;
            }
          }
        });
      }

      return dadosPorDia;
    },
    enabled: !!tiposRefeicao
  });

  const { data: distributionData } = useQuery({
    queryKey: ['distribution-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('tipo_refeicao')
        .gte('data_uso', subDays(new Date(), 30).toISOString());

      if (error) {
        console.error('Erro ao buscar distribuição:', error);
        toast.error('Erro ao carregar distribuição de refeições');
        throw error;
      }

      const distribution = data.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([nome, valor]) => ({
        nome,
        valor
      }));
    }
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-data'],
    queryFn: async () => {
      const startDate = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('data_uso')
        .gte('data_uso', startDate.toISOString())
        .order('data_uso', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tendência:', error);
        toast.error('Erro ao carregar tendência de uso');
        throw error;
      }

      const trend = data.reduce((acc, curr) => {
        const dia = format(new Date(curr.data_uso), 'dd/MM', { locale: ptBR });
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(trend).map(([dia, total]) => ({
        dia,
        total
      }));
    }
  });

  return { weeklyData, distributionData, trendData };
};