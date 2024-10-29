import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dados mockados para tipos de refeição
const mockedMealTypes = [
  { id: 1, name: "Café da Manhã" },
  { id: 2, name: "Almoço" },
  { id: 3, name: "Lanche da Tarde" },
  { id: 4, name: "Jantar" },
  { id: 5, name: "Ceia" },
  { id: 6, name: "Extra" },
];

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const handleGenerateVouchers = () => {
    try {
      if (selectedDates.length === 0) {
        toast.error("Selecione pelo menos uma data");
        return;
      }

      if (!selectedMealType) {
        toast.error("Selecione um tipo de refeição");
        return;
      }

      const totalVouchers = quantity * selectedDates.length;
      toast.success(`${totalVouchers} voucher(s) descartável(is) gerado(s) com sucesso!`);
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
        <label className="text-sm font-medium">Quantidade de Vouchers por Data/Refeição</label>
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
            {mockedMealTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
            ))}
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