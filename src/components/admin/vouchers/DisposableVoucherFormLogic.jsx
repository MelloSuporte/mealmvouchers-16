import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import { useMealTypes } from '@/hooks/useMealTypes';
import { useVouchers } from '@/hooks/useVouchers';
import { useAdmin } from '@/contexts/AdminContext';

const generateUniqueCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [personName, setPersonName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const queryClient = useQueryClient();
  const { data: mealTypes, isLoading } = useMealTypes();
  const { data: allVouchers } = useVouchers();
  const { adminId } = useAdmin();

  const generateMutation = useMutation({
    mutationFn: async ({ mealTypeId, dataUso, personName, companyName }) => {
      const code = generateUniqueCode();
      console.log('Gerando voucher com código:', code);
      
      if (!adminId) {
        throw new Error('Administrador não identificado');
      }

      console.log('Admin ID:', adminId);
      
      const { data, error } = await supabase.rpc('insert_voucher_descartavel', {
        codigo: code,
        tipo_refeicao_id: mealTypeId,
        nome_pessoa: personName,
        nome_empresa: companyName,
        solicitante: adminId
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
    if (!personName || !companyName) {
      toast.error('Nome da pessoa e empresa são obrigatórios');
      return;
    }

    try {
      for (const mealTypeId of selectedMealTypes) {
        for (const date of selectedDates) {
          for (let i = 0; i < quantity; i++) {
            await generateMutation.mutateAsync({
              mealTypeId,
              dataUso: date,
              personName,
              companyName
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
    personName,
    setPersonName,
    companyName,
    setCompanyName,
    mealTypes,
    isLoading,
    isGenerating: generateMutation.isPending,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  };
};