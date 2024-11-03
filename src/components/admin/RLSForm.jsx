import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const response = await api.get(`/users/search?term=${searchTerm}`);
      return response.data || [];
    },
    enabled: searchTerm.length >= 3
  });

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/api/companies');
      return response.data || [];
    }
  });

  const handleSaveRLS = async () => {
    if (!selectedUser || !selectedCompany || selectedDates.length === 0) {
      toast.error("Por favor, preencha todos os campos e selecione pelo menos uma data.");
      return;
    }
    
    try {
      await api.post('/api/extra-vouchers', {
        userId: selectedUser,
        companyId: selectedCompany,
        dates: selectedDates
      });
      
      toast.success("Voucher extra liberado com sucesso!");
      setSelectedUser("");
      setSelectedCompany("");
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erro ao liberar voucher extra: " + error.message);
    }
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="searchUser">Buscar Usuário</Label>
        <Input
          id="searchUser"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite nome, CPF ou email"
          className="mb-2"
        />
        {searchTerm.length < 3 && (
          <p className="text-sm text-gray-500">
            Digite pelo menos 3 caracteres para buscar
          </p>
        )}
      </div>

      <Select 
        value={selectedUser} 
        onValueChange={setSelectedUser}
        disabled={isLoadingUsers}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingUsers ? "Carregando usuários..." : "Selecione o usuário"} />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.name} - {user.cpf}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedCompany} 
        onValueChange={setSelectedCompany}
        disabled={isLoadingCompanies}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingCompanies ? "Carregando empresas..." : "Selecione a empresa"} />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              {company.name}
            </SelectItem>
          ))}
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

      <div className="flex justify-center">
        <Button 
          type="button" 
          onClick={handleSaveRLS}
          className="px-6"
          disabled={isLoadingUsers || isLoadingCompanies}
        >
          Liberar Voucher Extra
        </Button>
      </div>
    </form>
  );
};

export default RLSForm;
