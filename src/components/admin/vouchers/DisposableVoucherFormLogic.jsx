import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import api from '@/utils/api';

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: mealTypes, isLoading } = useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('id, nome, valor, ativo')
        .eq('ativo', true);

      if (error) throw error;
      return data;
    }
  });

  const { data: allVouchers = [] } = useQuery({
    queryKey: ['disposableVouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers_descartaveis')
        .select(`
          *,
          tipos_refeicao (
            nome,
            valor
          )
        `)
        .order('data_expiracao', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleMealTypeToggle = (mealTypeId) => {
    setSelectedMealTypes(prev => {
      if (prev.includes(mealTypeId)) {
        return prev.filter(id => id !== mealTypeId);
      }
      return [...prev, mealTypeId];
    });
  };

  const handleGenerateVouchers = async () => {
    if (!selectedMealTypes.length || !selectedDates.length) {
      toast.error('Selecione pelo menos um tipo de refeição e uma data');
      return;
    }

    setIsGenerating(true);
    try {
      const formattedDates = selectedDates.map(date => date.toISOString());

      console.log('Enviando requisição para gerar vouchers:', {
        tipos_refeicao_ids: selectedMealTypes,
        datas: formattedDates,
        quantidade: quantity
      });

      const response = await api.post('/vouchers-descartaveis', {
        tipos_refeicao_ids: selectedMealTypes,
        datas: formattedDates,
        quantidade: quantity
      });

      console.log('Resposta da API:', response.data);

      if (response.data.success) {
        toast.success(response.data.message);
        queryClient.invalidateQueries({ queryKey: ['disposableVouchers'] });
      } else {
        throw new Error(response.data.error || 'Erro ao gerar vouchers');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error('Erro ao gerar vouchers: ' + (error.response?.data?.error || error.message));
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