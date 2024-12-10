import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import logger from '../../../config/logger';

const SetorSelect = ({ value, onValueChange }) => {
  const { data: setores, isLoading } = useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      logger.info('Buscando setores ativos...');
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
        throw error;
      }

      logger.info(`${data?.length || 0} setores encontrados`);
      return data || [];
    }
  });

  if (isLoading) return <SelectTrigger>Carregando setores...</SelectTrigger>;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o setor" />
      </SelectTrigger>
      <SelectContent>
        {setores?.map((setor) => (
          <SelectItem key={setor.id} value={setor.id.toString()}>
            {setor.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;