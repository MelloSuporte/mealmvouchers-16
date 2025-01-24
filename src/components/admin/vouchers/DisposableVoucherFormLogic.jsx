import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import { useMealTypes } from '@/hooks/useMealTypes';
import { useVouchers } from '@/hooks/useVouchers';
import { useAdmin } from '@/contexts/AdminContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    mutationFn: async ({ mealTypeId, personName, companyName, dataUso }) => {
      const code = generateUniqueCode();
      
      if (!adminId) {
        throw new Error('Administrador não identificado');
      }

      const { data, error } = await supabase.rpc('insert_voucher_descartavel', {
        p_codigo: code,
        p_tipo_refeicao_id: mealTypeId,
        p_nome_pessoa: personName,
        p_nome_empresa: companyName,
        p_solicitante: adminId,
        p_data_uso: dataUso
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

  const generatePDF = (voucherData) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Voucher Descartável', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Código: ${voucherData.codigo}`, 20, 40);
    doc.text(`Nome: ${voucherData.nome_pessoa}`, 20, 50);
    doc.text(`Empresa: ${voucherData.nome_empresa}`, 20, 60);
    doc.text(`Data de Uso: ${new Date(voucherData.data_uso).toLocaleDateString()}`, 20, 70);
    doc.text(`Tipo de Refeição: ${voucherData.tipo_refeicao?.nome || ''}`, 20, 80);
    
    doc.save(`voucher-${voucherData.codigo}.pdf`);
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
      for (const mealTypeId of selectedMealTypes) {
        for (const date of selectedDates) {
          for (let i = 0; i < quantity; i++) {
            const result = await generateMutation.mutateAsync({
              mealTypeId,
              personName,
              companyName,
              dataUso: date.toISOString()
            });

            if (result) {
              generatePDF({
                codigo: result.codigo,
                nome_pessoa: personName,
                nome_empresa: companyName,
                data_uso: date,
                tipo_refeicao: mealTypes.find(mt => mt.id === mealTypeId)
              });
            }
          }
        }
      }

      toast.success(`${selectedMealTypes.length * selectedDates.length * quantity} vouchers gerados com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers: ' + (error.message || 'Erro desconhecido'));
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