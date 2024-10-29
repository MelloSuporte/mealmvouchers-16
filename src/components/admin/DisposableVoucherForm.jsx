import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { executeQuery } from '../../utils/db';
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const { data: mealTypes, isLoading, error } = useQuery({
    queryKey: ['mealTypes'],
    queryFn: () => executeQuery('SELECT id, name FROM meal_types WHERE is_active = TRUE'),
  });

  const generateVoucherCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
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

      const allVouchers = [];
      selectedDates.forEach(date => {
        selectedMealTypes.forEach(mealTypeId => {
          for (let i = 0; i < quantity; i++) {
            const code = generateVoucherCode();
            allVouchers.push({
              code,
              mealTypeId,
              expiredAt: date
            });
          }
        });
      });

      // Inserir vouchers no banco
      await executeQuery(
        'INSERT INTO disposable_vouchers (code, meal_type_id, expired_at, created_by) VALUES ?',
        [allVouchers.map(v => [v.code, v.mealTypeId, v.expiredAt, 1])] // 1 é um placeholder para o ID do admin
      );

      const totalVouchers = quantity * selectedDates.length * selectedMealTypes.length;
      toast.success(`${totalVouchers} voucher(s) descartável(is) gerado(s) com sucesso!`);
      setQuantity(1);
      setSelectedMealTypes([]);
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
    }
  };

  const handleMealTypeToggle = (mealTypeId) => {
    setSelectedMealTypes(current => {
      if (current.includes(mealTypeId)) {
        return current.filter(id => id !== mealTypeId);
      } else {
        return [...current, mealTypeId];
      }
    });
  };

  if (isLoading) return <div>Carregando tipos de refeição...</div>;
  if (error) return <div>Erro ao carregar tipos de refeição: {error.message}</div>;

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

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipos de Refeição</label>
        <div className="grid grid-cols-2 gap-4">
          {mealTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`meal-type-${type.id}`}
                checked={selectedMealTypes.includes(type.id)}
                onCheckedChange={() => handleMealTypeToggle(type.id)}
              />
              <Label htmlFor={`meal-type-${type.id}`}>{type.name}</Label>
            </div>
          ))}
        </div>
      </div>

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

      <Button 
        onClick={handleGenerateVouchers}
        disabled={!selectedMealTypes.length || quantity < 1 || selectedDates.length === 0}
        className="w-full"
      >
        Gerar Vouchers Descartáveis
      </Button>
    </div>
  );
};

export default DisposableVoucherForm;