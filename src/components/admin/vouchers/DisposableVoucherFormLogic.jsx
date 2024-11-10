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
        .from('vouchers_descartaveis')
        .select(`
          *,
          tipos_refeicao (
            nome
          )
        `)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setAllVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Erro ao carregar vouchers existentes");
    }
  };

  const handleMealTypeToggle = (typeId) => {
    setSelectedMealTypes(current => 
      current.includes(typeId) 
        ? current.filter(id => id !== typeId)
        : [...current, typeId]
    );
  };

  const generateSequentialCode = async () => {
    const { data: lastVoucher } = await supabase
      .from('vouchers_descartaveis')
      .select('codigo')
      .order('codigo', { ascending: false })
      .limit(1)
      .single();

    const lastCode = lastVoucher ? parseInt(lastVoucher.codigo) : 0;
    return String(lastCode + 1).padStart(4, '0');
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
            const codigo = await generateSequentialCode();
            const { data, error } = await supabase
              .from('vouchers_descartaveis')
              .insert([{
                codigo,
                tipo_refeicao_id: mealTypeId,
                data_expiracao: `${formattedDate}T23:59:59`,
                usado: false
              }])
              .select(`
                *,
                tipos_refeicao (
                  nome
                )
              `)
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