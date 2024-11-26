import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from '../../../utils/api';

const CompanySelect = ({ value, onValueChange, includeAllOption = false, placeholder = "Selecione a empresa" }) => {
  const { data: empresas = [], isLoading, error } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      console.log('Iniciando busca de empresas via API...');
      try {
        const response = await api.get('/empresas');
        console.log('Resposta da API:', response.data);
        return response.data || [];
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
        {Array.isArray(empresas) && empresas.map((empresa) => (
          <SelectItem key={empresa.id} value={empresa.id.toString()}>
            {empresa.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySelect;