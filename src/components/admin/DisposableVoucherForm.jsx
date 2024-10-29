import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { executeQuery } from '../../utils/db';

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMealTypes();
  }, []);

  const loadMealTypes = async () => {
    try {
      const result = await executeQuery('SELECT * FROM meal_types WHERE is_active = TRUE ORDER BY name');
      setMealTypes(result);
      setIsLoading(false);
    } catch (error) {
      toast.error("Erro ao carregar tipos de refeição: " + error.message);
      setIsLoading(false);
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
    while (true) {
      // Generate a 4-digit numeric code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Check if code exists in database
      try {
        const result = await executeQuery(
          'SELECT code FROM disposable_vouchers WHERE code = ?',
          [code]
        );
        
        if (result.length === 0) {
          return code;
        }
      } catch (error) {
        console.error('Error checking voucher code:', error);
        throw new Error('Erro ao verificar código do voucher');
      }
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
      const generatedVouchers = [];

      for (let i = 0; i < totalVouchers; i++) {
        const code = await generateUniqueVoucherCode();
        generatedVouchers.push(code);
      }

      // Save vouchers to database
      for (const code of generatedVouchers) {
        await executeQuery(
          'INSERT INTO disposable_vouchers (code, meal_type_id, created_by) VALUES (?, ?, ?)',
          [code, selectedMealTypes[0], 1] // Assuming created_by = 1 for now
        );
      }

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

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipos de Refeição</label>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-2">
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
        </ScrollArea>
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

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateVouchers}
          disabled={selectedMealTypes.length === 0 || quantity < 1 || selectedDates.length === 0}
          className="px-6"
        >
          Gerar Vouchers Descartáveis
        </Button>
      </div>
    </div>
  );
};

export default DisposableVoucherForm;