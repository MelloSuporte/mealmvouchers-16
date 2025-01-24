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
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [personName, setPersonName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dataUso, setDataUso] = useState(null);
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

      console.log('Parâmetros da chamada:', {
        p_codigo: code,
        p_tipo_refeicao_id: mealTypeId,
        p_nome_pessoa: personName,
        p_nome_empresa: companyName,
        p_solicitante: adminId,
        p_data_uso: dataUso
      });
      
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
    
    // Adicionar cabeçalho
    doc.setFontSize(18);
    doc.text('Voucher Descartável', 105, 20, { align: 'center' });
    
    // Adicionar informações do voucher
    doc.setFontSize(12);
    doc.text(`Código: ${voucherData.codigo}`, 20, 40);
    doc.text(`Nome: ${voucherData.nome_pessoa}`, 20, 50);
    doc.text(`Empresa: ${voucherData.nome_empresa}`, 20, 60);
    doc.text(`Data de Uso: ${new Date(voucherData.data_uso).toLocaleDateString()}`, 20, 70);
    doc.text(`Tipo de Refeição: ${voucherData.tipo_refeicao?.nome || ''}`, 20, 80);
    
    // Adicionar QR Code ou código de barras se necessário
    
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

    if (!dataUso) {
      toast.error('Selecione a data de uso do voucher.');
      return;
    }

    try {
      const voucherPromises = selectedMealTypes.map(mealTypeId =>
        selectedDates.map(async () => {
          const result = await generateMutation.mutateAsync({
            mealTypeId,
            personName,
            companyName,
            dataUso: dataUso.toISOString()
          });

          // Gerar PDF para cada voucher
          if (result) {
            generatePDF({
              codigo: result.codigo,
              nome_pessoa: personName,
              nome_empresa: companyName,
              data_uso: dataUso,
              tipo_refeicao: mealTypes.find(mt => mt.id === mealTypeId)
            });
          }
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
    dataUso,
    setDataUso,
    mealTypes,
    isLoading,
    isGenerating: generateMutation.isPending,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  };
};