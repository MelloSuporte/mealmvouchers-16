import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from '../../../utils/api';

const CompanySelect = ({ value, onValueChange, includeAllOption = false, placeholder = "Selecione a empresa" }) => {
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/companies');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        toast.error('Erro ao carregar empresas');
        return [];
      }
    }
  });

  if (error) {
    toast.error('Erro ao carregar empresas');
  }

  const companyList = Array.isArray(companies) ? companies : [];

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Carregando empresas..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">Todas as empresas</SelectItem>
        )}
        {companyList.map((company) => (
          <SelectItem key={company.id} value={company.id.toString()}>
            {company.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySelect;