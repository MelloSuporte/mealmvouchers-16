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
  const { data: setores, isLoading, error } = useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      logger.info('Iniciando busca de setores...');
      
      // Log da conexão Supabase
      logger.info('Conexão Supabase:', {
        url: supabase.supabaseUrl,
        hasAuth: !!supabase.auth,
      });

      const { data, error } = await supabase
        .from('setores')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
        throw error;
      }

      // Log detalhado dos dados recebidos
      logger.info('Dados brutos recebidos dos setores:', data);
      logger.info(`Total de setores encontrados: ${data?.length || 0}`);

      if (!data || data.length === 0) {
        logger.info('Nenhum setor cadastrado ou ativo no momento');
        toast.warning('Nenhum setor disponível para seleção');
      }

      return data || [];
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Log do estado atual
  React.useEffect(() => {
    logger.info('Estado atual dos setores:', {
      loading: isLoading,
      error: error,
      setoresCount: setores?.length,
      setores: setores
    });
  }, [setores, isLoading, error]);

  if (error) {
    logger.error('Erro no componente SetorSelect:', error);
    toast.error('Erro ao carregar setores');
  }

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