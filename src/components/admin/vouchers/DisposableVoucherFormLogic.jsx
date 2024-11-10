import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { format } from 'date-fns';
import api from '../../../utils/api';

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
      const response = await api.get('/meals');
      if (response.data && Array.isArray(response.data)) {
        const filteredMeals = response.data.filter(meal => 
          meal.is_active && meal.name?.toLowerCase() !== 'extra'
        );
        setMealTypes(filteredMeals);
      } else {
        setMealTypes([]);
        toast.error("Formato inválido de dados recebidos");
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
      const response = await api.get('/vouchers/disposable');
      setAllVouchers(Array.isArray(response.data) ? response.data : []);
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
            try {
              const response = await api.post('/vouchers/create', {
                meal_type_id: mealTypeId,
                expired_at: `${formattedDate}T23:59:59`
              });

              if (response.data?.success) {
                newVouchers.push(response.data.voucher);
              }
            } catch (error) {
              toast.error(`Erro ao gerar voucher: ${error.response?.data?.error || error.message}`);
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