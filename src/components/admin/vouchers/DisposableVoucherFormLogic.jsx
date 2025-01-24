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
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [personName, setPersonName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const queryClient = useQueryClient();
  const { data: mealTypes, isLoading } = useMealTypes();
  const { data: allVouchers } = useVouchers();
  const { adminId } = useAdmin();

  const generateMutation = useMutation({
    mutationFn: async ({ mealTypeId, personName, companyName, date }) => {
      const code = generateUniqueCode();
      
      if (!adminId) {
        throw new Error('Administrador não identificado');
      }

      console.log('Parâmetros da chamada:', {
        p_codigo: code,
        p_tipo_refeicao_id: mealTypeId,
        p_data_expiracao: date.toISOString().split('T')[0],
        p_nome_pessoa: personName,
        p_nome_empresa: companyName
      });
      
      const { data, error } = await supabase.rpc('insert_voucher_descartavel', {
        p_codigo: code,
        p_tipo_refeicao_id: mealTypeId,
        p_data_expiracao: date.toISOString().split('T')[0],
        p_nome_pessoa: personName,
        p_nome_empresa: companyName
      });

      if (error) {
        console.error('Erro ao gerar voucher:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers-descartaveis'] });
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
      toast.error('Nome da pessoa e nome da empresa são obrigatórios.');
      return;
    }

    if (!selectedMealTypes.length) {
      toast.error('Selecione pelo menos um tipo de refeição.');
      return;
    }

    if (!selectedDates.length) {
      toast.error('Selecione pelo menos uma data.');
      return;
    }

    try {
      const voucherPromises = selectedMealTypes.map(mealTypeId =>
        selectedDates.map(async (date) => {
          await generateMutation.mutateAsync({
            mealTypeId,
            personName,
            companyName,
            date
          });
        })
      );

      await Promise.all(voucherPromises.flat());
      toast.success(`${selectedMealTypes.length * selectedDates.length} vouchers gerados com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return {
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