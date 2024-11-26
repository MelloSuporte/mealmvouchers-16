import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CompanyUserSelector = ({
  selectedCompany,
  setSelectedCompany,
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser,
  companies,
  users,
  isLoadingCompanies,
  isLoadingUsers
}) => {
  const formatCPF = (cpf) => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const usersList = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-4">
      <div>
        <Select
          value={selectedCompany}
          onValueChange={setSelectedCompany}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies?.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          placeholder="Digite o nome ou CPF do usuário"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoadingUsers}
        />
      </div>

      <div>
        <Select
          value={selectedUser}
          onValueChange={setSelectedUser}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o usuário" />
          </SelectTrigger>
          <SelectContent>
            {usersList.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.nome} - {formatCPF(user.cpf)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CompanyUserSelector;