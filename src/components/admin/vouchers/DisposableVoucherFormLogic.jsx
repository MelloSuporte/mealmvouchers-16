import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMealTypes } from '@/hooks/useMealTypes';
import { useVouchers } from '@/hooks/useVouchers';
import { generateVouchers } from '@/services/voucherService';

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: mealTypes, isLoading } = useMealTypes();
  const { data: allVouchers = [] } = useVouchers();

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
      await generateVouchers({
        selectedMealTypes,
        selectedDates,
        quantity
      });
      queryClient.invalidateQueries({ queryKey: ['disposableVouchers'] });
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