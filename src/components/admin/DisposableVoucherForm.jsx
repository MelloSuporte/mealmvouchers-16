import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import VoucherTypeSelector from './vouchers/VoucherTypeSelector';
import VoucherTable from './vouchers/VoucherTable';
import api from '../../utils/api';

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);

  useEffect(() => {
    loadMealTypes();
    loadAllVouchers();
  }, []);

  const loadMealTypes = async () => {
    try {
      const response = await api.get('/meals');
      if (Array.isArray(response.data)) {
        setMealTypes(response.data.filter(meal => meal.is_active));
      } else {
        toast.error("Formato inválido de dados recebidos");
        setMealTypes([]);
      }
    } catch (error) {
      toast.error("Erro ao carregar tipos de refeição: " + error.message);
      setMealTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllVouchers = async () => {
    try {
      const response = await api.get('/vouchers/disposable');
      setAllVouchers(response.data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const handleMealTypeToggle = (typeId) => {
    setSelectedMealTypes(current => {
      if (current.includes(typeId)) {
        return current.filter(id => id !== typeId);
      } else {
        return [...current, typeId];
      }
    });
  };

  const generateUniqueVoucherCode = async () => {
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const result = await api.post('/vouchers/check', { code });
      if (!result.data.exists) {
        return code;
      }
      return generateUniqueVoucherCode();
    } catch (error) {
      console.error('Error checking voucher code:', error);
      throw new Error('Erro ao verificar código do voucher');
    }
  };

  const handleGenerateVouchers = async () => {
    try {
      if (selectedDates.length === 0) {
        toast.error("Selecione pelo menos uma data");
        return;
      }

      if (selectedMealTypes.length === 0) {
        toast.error("Selecione pelo menos um tipo de refeição");
        return;
      }

      const totalVouchers = quantity * selectedDates.length * selectedMealTypes.length;
      const newVouchers = [];

      for (let i = 0; i < totalVouchers; i++) {
        const code = await generateUniqueVoucherCode();
        const response = await api.post('/vouchers/create', {
          code,
          meal_type_id: selectedMealTypes[0],
          created_by: 1
        });

        if (response.data.success) {
          newVouchers.push(response.data.voucher);
        }
      }

      setGeneratedVouchers(newVouchers);
      setAllVouchers(prev => [...newVouchers, ...prev]);
      toast.success(`${totalVouchers} voucher(s) descartável(is) gerado(s) com sucesso!`);
      
      setQuantity(1);
      setSelectedMealTypes([]);
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
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
          onChange={(e) => setQuantity(parseInt(e.target.value))}
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

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateVouchers}
          disabled={selectedMealTypes.length === 0 || quantity < 1 || selectedDates.length === 0}
          className="px-6"
        >
          Gerar Vouchers Descartáveis
        </Button>
      </div>

      <VoucherTable vouchers={allVouchers} />
    </div>
  );
};

export default DisposableVoucherForm;