import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import api from '@/utils/api';

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: mealTypes, isLoading } = useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
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
            nome
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
      const response = await api.post('/vouchers-descartaveis', {
        tipos_refeicao_ids: selectedMealTypes,
        datas: selectedDates,
        quantidade: quantity
      });

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
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