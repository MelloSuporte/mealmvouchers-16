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
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            toast.info('Usuário não encontrado');
            return null;
          }
          throw error;
        }

        if (!data) {
          toast.info('Usuário não encontrado');
          return null;
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        toast.error('Erro ao buscar usuário: ' + error.message);
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
    <div className="space-y-2">
      <div>
        <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
          Empresa
        </label>
        <Select
          value={selectedCompany}
          onValueChange={setSelectedCompany}
          disabled={isLoadingCompanies}
        >
          <SelectTrigger className="w-full h-7 text-[10px]">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px] py-0.5">Todas as Empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()} className="text-[10px] py-0.5">
                {company.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
          Buscar Usuário
        </label>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Digite o CPF do usuário"
          className="w-full h-7 text-[10px]"
          maxLength={14}
        />
      </div>

      {searchTerm.length >= 11 && searchedUser && (
        <div>
          <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
            Selecionar Usuário
          </label>
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
            disabled={isLoadingUser}
          >
            <SelectTrigger className="w-full h-7 text-[10px]">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={searchedUser.id.toString()} className="text-[10px] py-0.5">
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