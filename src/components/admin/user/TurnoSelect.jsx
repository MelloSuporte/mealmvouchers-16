import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import logger from '../../../config/logger';

const TurnoSelect = ({ value, onValueChange, includeAllOption = false }) => {
  const { data: turnos, isLoading } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      logger.info('Buscando turnos ativos...');
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');

      if (error) {
        logger.error('Erro ao carregar turnos:', error);
        toast.error('Erro ao carregar turnos');
        throw error;
      }

      logger.info(`${data?.length || 0} turnos encontrados`);
      return data || [];
    }
  });

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const getTurnoLabel = (tipoTurno) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[tipoTurno] || tipoTurno;
  };

  return (
    <Select 
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full h-8 text-sm">
        <SelectValue placeholder={isLoading ? "Carregando turnos..." : "Selecione o turno"} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">Todos</SelectItem>
        )}
        {turnos && turnos.length > 0 ? (
          turnos
            .filter(turno => turno.ativo)
            .map((turno) => (
              <SelectItem 
                key={turno.id} 
                value={turno.id.toString()}
              >
                {`${getTurnoLabel(turno.tipo_turno)} (${formatTime(turno.horario_inicio)} - ${formatTime(turno.horario_fim)})`}
              </SelectItem>
            ))
        ) : (
          <SelectItem value="no-turnos" disabled>
            Nenhum turno disponível
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default TurnoSelect;