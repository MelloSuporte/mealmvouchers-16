import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';

const CompanySelect = ({ value, onValueChange, includeAllOption = false, placeholder = "Selecione a empresa" }) => {
  const { data: empresas = [], isLoading, error } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (error) throw error;

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas: ' + error.message);
        return [];
      }
    }
  });

  if (error) {
    toast.error('Erro ao carregar empresas');
  }

  const companiesArray = Array.isArray(empresas) ? empresas : [];

  return (
    <Select 
      value={value?.toString()} 
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
        {companiesArray.map((empresa) => (
          <SelectItem key={empresa.id} value={empresa.id.toString()}>
            {empresa.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySelect;