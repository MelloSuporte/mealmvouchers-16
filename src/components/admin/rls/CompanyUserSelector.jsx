import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  const companiesList = Array.isArray(companies) ? companies : [];
  const usersList = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa
        </label>
        <Select
          value={selectedCompany}
          onValueChange={setSelectedCompany}
          disabled={isLoadingCompanies}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Empresas</SelectItem>
            {companiesList.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Usuário
        </label>
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite o nome ou CPF do usuário"
          className="w-full"
        />
      </div>

      {searchTerm.length >= 3 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecionar Usuário
          </label>
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
            disabled={isLoadingUsers}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {usersList.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.nome} - {user.cpf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CompanyUserSelector;