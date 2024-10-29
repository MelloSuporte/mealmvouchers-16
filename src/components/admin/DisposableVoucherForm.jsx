import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { executeQuery } from '../../utils/db';

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());

  const generateVoucherCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleGenerateVouchers = async () => {
    try {
      const vouchers = [];
      for (let i = 0; i < quantity; i++) {
        const code = generateVoucherCode();
        vouchers.push({
          code,
          mealTypeId: selectedMealType,
          expiredAt: expirationDate
        });
      }

      // Inserir vouchers no banco
      await executeQuery(
        'INSERT INTO disposable_vouchers (code, meal_type_id, expired_at, created_by) VALUES ?',
        [vouchers.map(v => [v.code, v.mealTypeId, v.expiredAt, 1])] // 1 é um placeholder para o ID do admin
      );

      toast.success(`${quantity} voucher(s) descartável(is) gerado(s) com sucesso!`);
      setQuantity(1);
      setSelectedMealType("");
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade de Vouchers</label>
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
        <label className="text-sm font-medium">Data de Expiração</label>
        <Calendar
          mode="single"
          selected={expirationDate}
          onSelect={setExpirationDate}
          className="rounded-md border"
        />
      </div>

      <Button 
        onClick={handleGenerateVouchers}
        disabled={!selectedMealType || quantity < 1}
        className="w-full"
      >
        Gerar Vouchers Descartáveis
      </Button>
    </div>
  );
};

export default DisposableVoucherForm;