import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useVouchers } from '@/hooks/useVouchers';
import { useMealTypes } from '@/hooks/useMealTypes';
import { toast } from 'sonner';

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const queryClient = useQueryClient();

  const { data: mealTypes, isLoading: isMealTypesLoading } = useMealTypes();
  const { data: allVouchers = [] } = useVouchers();

  const generateVouchersMutation = useMutation({
    mutationFn: async ({ quantity, mealTypeIds, dates }) => {
      const promises = [];
      
      for (const mealTypeId of mealTypeIds) {
        for (const date of dates) {
          for (let i = 0; i < quantity; i++) {
            const { error } = await supabase.rpc('insert_voucher_descartavel', {
              p_tipo_refeicao_id: mealTypeId,
              p_data_expiracao: date,
              p_codigo: Math.floor(1000 + Math.random() * 9000).toString()
            });
            
            if (error) throw error;
          }
        }
      }
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Vouchers gerados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['vouchers-descartaveis'] });
      setSelectedMealTypes([]);
      setSelectedDates([]);
      setQuantity(1);
    },
    onError: (error) => {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers. Por favor, tente novamente.');
    }
  });

  const handleMealTypeToggle = (mealTypeId) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealTypeId)
        ? prev.filter(id => id !== mealTypeId)
        : [...prev, mealTypeId]
    );
  };

  const handleGenerateVouchers = async () => {
    if (!selectedMealTypes.length || !selectedDates.length || quantity < 1) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await generateVouchersMutation.mutateAsync({
        quantity,
        mealTypeIds: selectedMealTypes,
        dates: selectedDates
      });
    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
    }
  };

  return {
    quantity,
    setQuantity,
    selectedMealTypes,
    selectedDates,
    setSelectedDates,
    mealTypes: mealTypes || [],
    isLoading: isMealTypesLoading,
    isGenerating: generateVouchersMutation.isPending,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  };
};