import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from '../../../utils/api';

const CompanySelect = ({ value, onValueChange }) => {
  const { data: companies = [], isLoading, error } = useQuery({
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
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Carregando empresas..." : "Selecione a empresa"} />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id.toString()}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySelect;