import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '../../../utils/api';

const CompanySelect = ({ value, onValueChange }) => {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/companies');
        // Ensure we return an array even if the response is unexpected
        const companies = response.data?.companies || response.data || [];
        return Array.isArray(companies) ? companies : [];
      } catch (error) {
        console.error('Error fetching companies:', error);
        return [];
      }
    }
  });

  const companies = Array.isArray(companiesData) ? companiesData : [];

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