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
        
        const { data, error } = await supabase
          .from('setores')
          .select('id, nome_setor')
          .eq('ativo', true)
          .order('nome_setor');

        if (error) {
          logger.error('Erro ao buscar setores:', error);
          throw error;
        }

        logger.info(`${data?.length || 0} setores encontrados`);
        console.log('Setores encontrados:', data);
        
        return data || [];
      } catch (error) {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  if (error) {
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

  return (
    <Select 
      value={value?.toString()} 
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all" className="text-sm">Todos os setores</SelectItem>
        )}
        {setores?.map((setor) => (
          <SelectItem 
            key={setor.id} 
            value={setor.id.toString()} 
            className="text-sm"
          >
            {setor.nome_setor}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;