import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import { useMealTypes } from '@/hooks/useMealTypes';
import { useVouchers } from '@/hooks/useVouchers';

const generateUniqueCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const queryClient = useQueryClient();
  const { data: mealTypes, isLoading } = useMealTypes();
  const { data: allVouchers } = useVouchers();

  const generateMutation = useMutation({
    mutationFn: async ({ mealTypeId, expirationDate }) => {
      const code = generateUniqueCode();
      console.log('Gerando voucher com código:', code);
      
      const { data, error } = await supabase.rpc('insert_voucher_descartavel', {
        p_codigo: code,
        p_tipo_refeicao_id: mealTypeId,
        p_data_expiracao: expirationDate
      });

      if (error) {
        console.error('Erro ao gerar voucher:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers-descartaveis'] });
      toast.success('Vouchers gerados com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers: ' + error.message);
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
    try {
      for (const mealTypeId of selectedMealTypes) {
        for (const date of selectedDates) {
          for (let i = 0; i < quantity; i++) {
            await generateMutation.mutateAsync({
              mealTypeId,
              expirationDate: date.toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers: ' + error.message);
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
    isGenerating: generateMutation.isPending,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  };
};