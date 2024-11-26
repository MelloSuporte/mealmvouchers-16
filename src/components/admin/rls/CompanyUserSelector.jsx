import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { toast } from "sonner";

const CompanyUserSelector = ({
  selectedCompany,
  setSelectedCompany,
  searchTerm,
  setSearchTerm,
  selectedUser,
  setSelectedUser
}) => {
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome')
          .order('nome');

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas: ' + error.message);
        return [];
      }
    }
  });

  const { data: searchedUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['usuario', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 11) return null;
      try {
        const cleanCPF = searchTerm.replace(/\D/g, '');
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nome, cpf')
          .eq('cpf', cleanCPF)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      }
    },
    enabled: searchTerm.length >= 11
  });

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= 14) {
      setSearchTerm(value);
      if (searchedUser) {
        setSelectedUser(searchedUser.id.toString());
      }
    }
  };

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
            {companies.map((company) => (
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
          onChange={handleInputChange}
          placeholder="Digite o CPF do usuário"
          className="w-full"
          maxLength={14}
        />
      </div>

      {searchTerm.length >= 11 && searchedUser && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecionar Usuário
          </label>
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
            disabled={isLoadingUser}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={searchedUser.id.toString()}>
                {searchedUser.nome} - {searchedUser.cpf}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CompanyUserSelector;