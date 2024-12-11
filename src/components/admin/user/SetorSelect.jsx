import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

const SetorSelect = ({ value, onValueChange, includeAllOption = false, placeholder = "Selecione o setor" }) => {
  const { data: setores = [], isLoading, error } = useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de setores...');
        const { data, error } = await supabase
          .from('setores')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (error) {
          logger.error('Erro ao buscar setores:', error);
          console.error('Erro Supabase:', error);
          throw error;
        }

        // Log detalhado dos dados retornados
        console.log('Resposta completa da consulta:', data);
        logger.info(`${data?.length || 0} setores encontrados`);
        
        if (!data || data.length === 0) {
          logger.warn('Nenhum setor encontrado na tabela');
          console.warn('Tabela de setores vazia');
          
          // Vamos inserir alguns setores padrão se a tabela estiver vazia
          const defaultSetores = [
            { nome: 'Administrativo' },
            { nome: 'Produção' },
            { nome: 'Manutenção' },
            { nome: 'Logística' },
            { nome: 'Qualidade' }
          ];

          const { data: insertedData, error: insertError } = await supabase
            .from('setores')
            .insert(defaultSetores)
            .select();

          if (insertError) {
            logger.error('Erro ao inserir setores padrão:', insertError);
            throw insertError;
          }

          logger.info('Setores padrão inseridos com sucesso');
          return insertedData || [];
        }

        return data || [];
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
  }

  // Log do estado atual do componente
  console.log('Estado atual:', {
    value,
    setoresCount: setores?.length,
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
        {setores && setores.map((setor) => (
          <SelectItem 
            key={setor.id} 
            value={setor.id.toString()} 
            className="text-sm"
          >
            {setor.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;