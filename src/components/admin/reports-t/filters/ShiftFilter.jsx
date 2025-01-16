import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

const ShiftFilter = ({ value, onChange }) => {
  const { data: shifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-2">
      <Label>Turno</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o turno" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {shifts?.map((shift) => (
            <SelectItem key={shift.id} value={shift.tipo_turno}>
              {shift.tipo_turno}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShiftFilter;