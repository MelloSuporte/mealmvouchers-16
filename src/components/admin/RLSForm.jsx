import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSaveRLS = () => {
    console.log('Salvando RLS:', { selectedUser, selectedCompany, selectedDate });
    // Aqui você implementaria a lógica para salvar os dados do RLS
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
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>
      <Button type="button" onClick={handleSaveRLS}>Liberar Voucher Extra</Button>
    </form>
  );
};

export default RLSForm;