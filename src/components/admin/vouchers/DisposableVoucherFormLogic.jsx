import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';

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
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('vouchers_descartaveis')
        .select(`
          *,
          tipos_refeicao (
            nome,
            valor
          )
        `)
        .gte('data_expiracao', now) // Filtra vouchers não expirados
        .eq('usado', false) // Filtra apenas vouchers não usados
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
      const vouchers = [];
      
      for (const data of selectedDates) {
        for (const tipo_refeicao_id of selectedMealTypes) {
          for (let i = 0; i < quantity; i++) {
            const code = await generateUniqueCode();
            
            console.log(`Gerando voucher com código ${code} para data ${data}`);
            
            const { data: voucher, error } = await supabase
              .from('vouchers_descartaveis')
              .insert({
                codigo: code,
                tipo_refeicao_id: tipo_refeicao_id,
                data_expiracao: data.toISOString(),
                usado: false,
                data_criacao: new Date().toISOString()
              })
              .select(`
                *,
                tipos_refeicao (
                  nome,
                  valor
                )
              `)
              .single();

            if (error) {
              console.error('Erro ao inserir voucher:', error);
              throw error;
            }

            vouchers.push(voucher);
          }
        }
      }

      console.log(`${vouchers.length} vouchers gerados com sucesso`);
      toast.success(`${vouchers.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
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