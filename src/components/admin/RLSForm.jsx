import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const handleSaveRLS = () => {
    if (!selectedUser || !selectedCompany || selectedDates.length === 0) {
      toast.error("Por favor, preencha todos os campos e selecione pelo menos uma data.");
      return;
    }
    
    console.log('Salvando Voucher Extra:', { 
      selectedUser, 
      selectedCompany, 
      selectedDates 
    });
    toast.success("Voucher extra liberado com sucesso!");
  };

  return (
    <form className="space-y-4">
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o usuário" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user1">Usuário 1</SelectItem>
          <SelectItem value="user2">Usuário 2</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedCompany} onValueChange={setSelectedCompany}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>

      <div className="border rounded-md p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
          weekStartsOn={0}
          formatters={{
            formatCaption: (date) => {
              const month = ptBR.localize.month(date.getMonth());
              return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
            }
          }}
          ISOWeek
        />
      </div>

      <div className="text-sm text-gray-500">
        {selectedDates.length > 0 && (
          <p>Datas selecionadas: {selectedDates.length}</p>
        )}
      </div>

      <Button 
        type="button" 
        onClick={handleSaveRLS}
        className="w-full"
      >
        Liberar Voucher Extra
      </Button>
    </form>
  );
};

export default RLSForm;