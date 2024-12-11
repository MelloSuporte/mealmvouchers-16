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
          throw error;
        }

        logger.info(`${data?.length || 0} setores encontrados:`, data);
        return data || [];
      } catch (error) {
        logger.error('Erro ao carregar setores:', error);
        toast.error('Erro ao carregar setores');
        return [];
      }
    }
  });

  if (error) {
    toast.error('Erro ao carregar setores');
  }

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
        {Array.isArray(setores) && setores.map((setor) => (
          <SelectItem key={setor.id} value={setor.id.toString()} className="text-sm">
            {setor.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SetorSelect;