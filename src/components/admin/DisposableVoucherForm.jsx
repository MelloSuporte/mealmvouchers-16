import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import VoucherTypeSelector from './vouchers/VoucherTypeSelector';
import VoucherTable from './vouchers/VoucherTable';
import api from '../../utils/api';
import { format } from 'date-fns';

const DisposableVoucherForm = () => {
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
      if (response.data && Array.isArray(response.data)) {
        setAllVouchers(response.data);
      } else {
        setAllVouchers([]);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error("Erro ao carregar vouchers existentes");
      setAllVouchers([]);
    }
  };

  const handleMealTypeToggle = (typeId) => {
    if (!typeId) return;

    const mealType = mealTypes.find(type => type.id === typeId);
    
    if (mealType && mealType.name?.toLowerCase() === 'extra') {
      toast.error("Voucher Descartável não disponível para uso Extra");
      return;
    }

    setSelectedMealTypes(current => {
      if (!Array.isArray(current)) return [typeId];
      return current.includes(typeId) 
        ? current.filter(id => id !== typeId)
        : [...current, typeId];
    });
  };

  const handleGenerateVouchers = async () => {
    if (!Array.isArray(selectedDates) || selectedDates.length === 0) {
      toast.error("Selecione pelo menos uma data");
      return;
    }

    if (!Array.isArray(selectedMealTypes) || selectedMealTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de refeição");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const invalidDates = selectedDates.filter(date => date < today);
    if (invalidDates.length > 0) {
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
              console.error('Error generating voucher:', error);
              toast.error(`Erro ao gerar voucher: ${error.response?.data?.error || error.message}`);
            }
          }
        }
      }

      if (newVouchers.length > 0) {
        setAllVouchers(prev => [...newVouchers, ...(Array.isArray(prev) ? prev : [])]);
        toast.success(`${newVouchers.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
        
        setQuantity(1);
        setSelectedMealTypes([]);
        setSelectedDates([]);
      }
    } catch (error) {
      console.error('Error in voucher generation:', error);
      toast.error("Erro ao gerar vouchers: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div>Carregando tipos de refeição...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade de Vouchers por Data/Refeição</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>

      <VoucherTypeSelector 
        mealTypes={mealTypes}
        selectedMealTypes={selectedMealTypes}
        onMealTypeToggle={handleMealTypeToggle}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Datas de Expiração</label>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
          formatters={{
            formatCaption: (date) => {
              const month = ptBR.localize.month(date.getMonth());
              return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
            }
          }}
        />
        <p className="text-sm text-gray-500">
          {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleGenerateVouchers}
          disabled={
            !Array.isArray(selectedMealTypes) || 
            selectedMealTypes.length === 0 || 
            quantity < 1 || 
            !Array.isArray(selectedDates) || 
            selectedDates.length === 0 || 
            isGenerating
          }
          className="px-6"
        >
          {isGenerating ? 'Gerando...' : 'Gerar Vouchers Descartáveis'}
        </Button>
      </div>

      <VoucherTable vouchers={Array.isArray(allVouchers) ? allVouchers : []} />
    </div>
  );
};

export default DisposableVoucherForm;