import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { Loader2, AlertCircle } from 'lucide-react';

const SetorSelect = ({ value, onValueChange, includeAllOption = false, placeholder = "Selecione o setor" }) => {
  const { data: setores = [], isLoading, error } = useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de setores...');
        console.log('Iniciando consulta à tabela setores');
        
        const { data, error } = await supabase
          .from('setores')
          .select('id, nome_setor')
          .eq('ativo', true)
          .order('nome_setor');

        if (error) {
          logger.error('Erro ao buscar setores:', error);
          console.error('Erro Supabase:', error);
          throw error;
        }

        console.log('Dados retornados da consulta:', data);
        logger.info(`${data?.length || 0} setores encontrados`);
        
        if (!data || data.length === 0) {
          logger.warn('Nenhum setor encontrado na tabela');
          console.warn('Tabela de setores vazia');
          
          const defaultSetores = [
            { nome_setor: 'Administrativo' },
            { nome_setor: 'Produção' },
            { nome_setor: 'Manutenção' },
            { nome_setor: 'Logística' },
            { nome_setor: 'Qualidade' }
          ];

          console.log('Tentando inserir setores padrão:', defaultSetores);

          const { data: insertedData, error: insertError } = await supabase
            .from('setores')
            .insert(defaultSetores)
            .select();

          if (insertError) {
            logger.error('Erro ao inserir setores padrão:', insertError);
            console.error('Erro ao inserir setores:', insertError);
            throw insertError;
          }

          logger.info('Setores padrão inseridos com sucesso');
          console.log('Setores padrão inseridos:', insertedData);
          return insertedData || [];
        }

        return data;
      } catch (error) {
        logger.error('Erro ao carregar setores:', error);
        console.error('Erro completo:', error);
        toast.error('Erro ao carregar setores');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  if (error) {
    console.error('Erro no componente:', error);
    toast.error('Erro ao carregar setores');
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle size={16} />
        <span>Erro ao carregar setores</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        <span>Carregando setores...</span>
      </div>
    );
  }

  console.log('Estado atual do componente:', {
    value,
    setoresCount: setores?.length,
    setores,
    isLoading,
    hasError: !!error
  });

  return (
    <Select 
      value={value?.toString()} 
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={isLoading ? "Carregando setores..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all" className="text-sm">Todos os setores</SelectItem>
        )}
        {setores && setores.map((setor) => {
          console.log('Renderizando setor:', setor);
          return (
            <SelectItem 
              key={setor.id} 
              value={setor.id.toString()} 
              className="text-sm"
            >
              {setor.nome_setor}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;