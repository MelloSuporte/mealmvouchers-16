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
      logger.info('Iniciando busca de setores...');
      
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

      // Log the actual data received
      logger.info('Dados recebidos dos setores:', data);
      logger.info(`Total de setores encontrados: ${data?.length || 0}`);

      if (!data || data.length === 0) {
        logger.info('Nenhum setor cadastrado ou ativo no momento');
        toast.warning('Nenhum setor disponível para seleção');
      }

      return data || [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Log the current state
  React.useEffect(() => {
    logger.info('Estado atual dos setores:', {
      loading: isLoading,
      setoresCount: setores?.length,
      setores: setores
    });
  }, [setores, isLoading]);

  return (
    <Select 
      value={value?.toString()} 
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full h-8 text-sm">
        <SelectValue placeholder={
          isLoading 
            ? "Carregando setores..." 
            : !setores?.length 
              ? "Nenhum setor disponível" 
              : "Selecione o setor"
        } />
      </SelectTrigger>
      <SelectContent>
        {setores && setores.length > 0 ? (
          setores.map((setor) => (
            <SelectItem key={setor.id} value={setor.id.toString()}>
              {setor.nome}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-setores" disabled>
            {isLoading ? "Carregando..." : "Nenhum setor cadastrado"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;