import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { supabase } from '../../../config/supabase';
import api from '../../../utils/api';

export const useDisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allVouchers, setAllVouchers] = useState([]);

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

    try {
      const formattedDates = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
      
      const response = await api.post('/api/vouchers-extra/generate', {
        usuario_id: selectedMealTypes[0],
        datas: formattedDates,
        observacao: 'Voucher extra gerado via sistema'
      });

      if (response.data.success) {
        setAllVouchers(prev => [...response.data.vouchers, ...prev]);
        toast.success(`${response.data.vouchers.length} voucher(s) extra(s) gerado(s) com sucesso!`);
        
        if (response.data.warnings) {
          response.data.warnings.forEach(warning => toast.warning(warning));
        }
        
        setQuantity(1);
        setSelectedMealTypes([]);
        setSelectedDates([]);
      } else {
        throw new Error(response.data.error || 'Erro ao gerar vouchers');
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast.error(error.response?.data?.error || "Erro ao gerar vouchers");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadMealTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('id, nome, hora_inicio, hora_fim, ativo')
        .eq('ativo', true);

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
      }
    } catch (error) {
      console.error('Error loading meal types:', error);
      toast.error("Erro ao carregar tipos de refeição");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers_extras')
        .select(`
          *,
          tipos_refeicao (
            nome
          )
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const formattedVouchers = data?.map(voucher => ({
        ...voucher,
        tipo_refeicao_nome: voucher.tipos_refeicao?.nome || 'Não especificado'
      })) || [];

      setAllVouchers(formattedVouchers);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Erro ao carregar vouchers existentes");
    }
  };

  useEffect(() => {
    loadMealTypes();
    loadAllVouchers();
  }, []);

  const handleMealTypeToggle = (typeId) => {
    setSelectedMealTypes(current => 
      current.includes(typeId) 
        ? current.filter(id => id !== typeId)
        : [...current, typeId]
    );
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