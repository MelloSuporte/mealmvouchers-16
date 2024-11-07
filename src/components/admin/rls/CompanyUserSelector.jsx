import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../../utils/api';

const CompanyUserSelector = ({ 
  selectedCompany, 
  setSelectedCompany, 
  searchTerm, 
  setSearchTerm, 
  selectedUser, 
  setSelectedUser,
  users = [],
  isLoadingUsers 
}) => {
  const { data: companies = [], isLoading: isLoadingCompanies, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/companies');
        return response.data || [];
      } catch (error) {
        toast.error("Erro ao carregar empresas: " + error.message);
        throw error;
      }
    }
  });

  if (error) {
    toast.error("Erro ao carregar empresas");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Select 
          value={selectedCompany} 
          onValueChange={setSelectedCompany}
          disabled={isLoadingCompanies}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCompanies ? "Carregando empresas..." : "Selecione a empresa"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="searchUser">Buscar Usuário (CPF)</Label>
        <Input
          id="searchUser"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite o CPF do usuário"
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
    </div>
  );
};

export default CompanyUserSelector;