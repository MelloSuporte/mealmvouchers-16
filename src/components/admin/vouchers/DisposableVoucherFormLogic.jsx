import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useDisposableVoucherFormLogic = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Buscar tipos de refeição
  const { data: mealTypes, isLoading } = useQuery({
    queryKey: ['meal-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    }
  });

  // Buscar vouchers descartáveis
  const { data: allVouchers = [] } = useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      logger.info('Buscando vouchers descartáveis...');
      
      const { data, error } = await supabase
        .from('vouchers_descartaveis')
        .select(`
          id,
          codigo,
          tipo_refeicao_id,
          data_expiracao,
          usado_em,
          data_uso,
          data_criacao,
          tipos_refeicao (
            id,
            nome,
            valor,
            horario_inicio,
            horario_fim,
            minutos_tolerancia
          )
        `)
        .is('usado_em', null)
        .is('data_uso', null)
        .gte('data_expiracao', new Date().toISOString())
        .order('data_criacao', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar vouchers descartáveis:', error);
        throw error;
      }

      logger.info('Vouchers encontrados:', {
        quantidade: data?.length || 0,
        primeiro: data?.[0]
      });

      return data || [];
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
    try {
      setIsGenerating(true);
      
      // Validações
      if (!selectedMealTypes.length || !selectedDates.length || quantity < 1) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Gerar vouchers para cada combinação de tipo de refeição e data
      for (const mealTypeId of selectedMealTypes) {
        for (const date of selectedDates) {
          for (let i = 0; i < quantity; i++) {
            const { error } = await supabase
              .from('vouchers_descartaveis')
              .insert({
                tipo_refeicao_id: mealTypeId,
                data_expiracao: new Date(date).toISOString(),
                codigo: Math.floor(1000 + Math.random() * 9000).toString()
              });

            if (error) {
              logger.error('Erro ao gerar voucher:', error);
              toast.error(`Erro ao gerar voucher: ${error.message}`);
              return;
            }
          }
        }
      }

      toast.success('Vouchers gerados com sucesso!');
      
      // Limpar seleções
      setSelectedMealTypes([]);
      setSelectedDates([]);
      setQuantity(1);
      
    } catch (error) {
      logger.error('Erro ao gerar vouchers:', error);
      toast.error('Erro ao gerar vouchers');
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