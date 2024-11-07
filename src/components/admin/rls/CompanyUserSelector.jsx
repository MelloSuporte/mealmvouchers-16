import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CompanyUserSelector = ({ 
  selectedCompany, 
  setSelectedCompany, 
  searchTerm, 
  setSearchTerm, 
  selectedUser, 
  setSelectedUser,
  companies = [],
  users = [],
  isLoadingCompanies,
  isLoadingUsers 
}) => {
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
            <SelectValue placeholder="Selecione a empresa" />
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