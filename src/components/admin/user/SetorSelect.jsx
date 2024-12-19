import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { toast } from 'sonner';

const SetorSelect = ({ value, onValueChange, includeAllOption = false }) => {
  const { data: setores, isLoading } = useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      logger.info('Iniciando busca de setores...');
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .eq('ativo', true)
        .order('nome_setor');

      if (error) {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
        throw error;
      }

      logger.info(`${data?.length || 0} setores encontrados`);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando setores..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o setor" />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">Todos</SelectItem>
        )}
        {setores?.map((setor) => (
          <SelectItem key={setor.id} value={setor.id.toString()}>
            {setor.nome_setor}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;