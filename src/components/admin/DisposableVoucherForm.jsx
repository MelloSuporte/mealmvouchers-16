import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { executeQuery } from '../../utils/db';
import { ptBR } from "date-fns/locale";

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const generateVoucherCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleGenerateVouchers = async () => {
    try {
      if (selectedDates.length === 0) {
        toast.error("Selecione pelo menos uma data");
        return;
      }

      const allVouchers = [];
      selectedDates.forEach(date => {
        for (let i = 0; i < quantity; i++) {
          const code = generateVoucherCode();
          allVouchers.push({
            code,
            mealTypeId: selectedMealType,
            expiredAt: date
          });
        }
      });

      // Inserir vouchers no banco
      await executeQuery(
        'INSERT INTO disposable_vouchers (code, meal_type_id, expired_at, created_by) VALUES ?',
        [allVouchers.map(v => [v.code, v.mealTypeId, v.expiredAt, 1])] // 1 é um placeholder para o ID do admin
      );

      toast.success(`${quantity * selectedDates.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
      setQuantity(1);
      setSelectedMealType("");
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade de Vouchers por Data</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Refeição</label>
        <Select value={selectedMealType} onValueChange={setSelectedMealType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de refeição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Café</SelectItem>
            <SelectItem value="2">Almoço</SelectItem>
            <SelectItem value="3">Lanche</SelectItem>
            <SelectItem value="4">Jantar</SelectItem>
            <SelectItem value="5">Ceia</SelectItem>
          </SelectContent>
        </Select>
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
        disabled={!selectedMealType || quantity < 1 || selectedDates.length === 0}
        className="w-full"
      >
        Gerar Vouchers Descartáveis
      </Button>
    </div>
  );
};

export default DisposableVoucherForm;