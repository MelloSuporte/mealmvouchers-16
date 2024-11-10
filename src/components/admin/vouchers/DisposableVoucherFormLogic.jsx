import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { supabase } from '../../../config/supabase';

export const useDisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allVouchers, setAllVouchers] = useState([]);

  useEffect(() => {
    loadMealTypes();
    loadAllVouchers();
  }, []);

  const loadMealTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .neq('nome', 'Extra');

      if (error) throw error;

      if (data) {
        const formattedMealTypes = data.map(meal => ({
          id: meal.id,
          name: meal.nome,
          start_time: meal.hora_inicio,
          end_time: meal.hora_fim,
          is_active: meal.ativo
        }));
        setMealTypes(formattedMealTypes);
      } else {
        setMealTypes([]);
        toast.error("Nenhum tipo de refeição encontrado");
      }
    } catch (error) {
      console.error('Error loading meal types:', error);
      setMealTypes([]);
      toast.error("Erro ao carregar tipos de refeição");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers_descartaveis')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setAllVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Erro ao carregar vouchers existentes");
      setAllVouchers([]);
    }
  };

  const handleMealTypeToggle = (typeId) => {
    if (!typeId) return;
    setSelectedMealTypes(current => 
      current.includes(typeId) 
        ? current.filter(id => id !== typeId)
        : [...current, typeId]
    );
  };

  const handleGenerateVouchers = async () => {
    if (!selectedDates.length) {
      toast.error("Selecione pelo menos uma data");
      return;
    }

    if (!selectedMealTypes.length) {
      toast.error("Selecione pelo menos um tipo de refeição");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDates.some(date => date < today)) {
      toast.error("Não é possível gerar vouchers para datas passadas");
      return;
    }

    setIsGenerating(true);
    const newVouchers = [];

    try {
      for (const date of selectedDates) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        for (const mealTypeId of selectedMealTypes) {
          for (let i = 0; i < quantity; i++) {
            const codigo = String(Math.floor(1000 + Math.random() * 9000));
            const { data, error } = await supabase
              .from('vouchers_descartaveis')
              .insert([{
                codigo,
                tipo_refeicao_id: mealTypeId,
                data_expiracao: `${formattedDate}T23:59:59`,
                usado: false
              }])
              .select()
              .single();

            if (error) {
              toast.error(`Erro ao gerar voucher: ${error.message}`);
              continue;
            }

            if (data) {
              newVouchers.push(data);
            }
          }
        }
      }

      if (newVouchers.length > 0) {
        setAllVouchers(prev => [...newVouchers, ...prev]);
        toast.success(`${newVouchers.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
        
        setQuantity(1);
        setSelectedMealTypes([]);
        setSelectedDates([]);
      }
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
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
