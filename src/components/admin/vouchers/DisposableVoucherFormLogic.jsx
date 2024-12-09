import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: mealTypes, isLoading } = useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      console.log('Iniciando busca de tipos de refeição...');
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar tipos de refeição:', error);
        toast.error(`Erro ao buscar tipos de refeição: ${error.message}`);
        throw error;
      }

      console.log('Tipos de refeição encontrados:', data);
      return data || [];
    }
  });

  const { data: allVouchers = [] } = useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            *,
            tipos_refeicao (
              nome,
              valor,
              horario_inicio,
              horario_fim,
              minutos_tolerancia
            )
          `)
          .eq('usado', false)
          .gte('data_expiracao', now.toISOString())
          .order('data_expiracao', { ascending: true });

        if (error) {
          console.error('Erro ao buscar vouchers:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar vouchers:', error);
        toast.error(`Erro ao buscar vouchers: ${error.message}`);
        return [];
      }
    },
    refetchInterval: 5000 // Atualiza a lista a cada 5 segundos
  });

  const handleMealTypeToggle = (mealTypeId) => {
    setSelectedMealTypes(prev => {
      if (prev.includes(mealTypeId)) {
        return prev.filter(id => id !== mealTypeId);
      }
      return [...prev, mealTypeId];
    });
  };

  const generateUniqueCode = async () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    const { data } = await supabase
      .from('vouchers_descartaveis')
      .select('codigo')
      .eq('codigo', code);

    if (data && data.length > 0) {
      return generateUniqueCode();
    }

    return code;
  };

  const handleGenerateVouchers = async () => {
    if (!selectedMealTypes.length || !selectedDates.length) {
      toast.error('Selecione pelo menos um tipo de refeição e uma data');
      return;
    }

    setIsGenerating(true);
    try {
      const voucherIds = [];
      
      for (const data of selectedDates) {
        for (const tipo_refeicao_id of selectedMealTypes) {
          for (let i = 0; i < quantity; i++) {
            const code = await generateUniqueCode();
            
            console.log(`Gerando voucher com código ${code} para data ${data}`);
            
            const { data: voucherId, error } = await supabase
              .rpc('insert_voucher_descartavel', {
                p_tipo_refeicao_id: tipo_refeicao_id,
                p_data_expiracao: data.toISOString().split('T')[0],
                p_codigo: code
              });

            if (error) {
              console.error('Erro ao inserir voucher:', error);
              throw error;
            }

            voucherIds.push(voucherId);
          }
        }
      }

      console.log(`${voucherIds.length} vouchers gerados com sucesso`);
      toast.success(`${voucherIds.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['disposableVouchers'] });
    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    quantity,
    setQuantity,
    selectedMealTypes,
    selectedDates,
    setSelectedDates,
    mealTypes,
    isLoading,
    isGenerating,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  };
};