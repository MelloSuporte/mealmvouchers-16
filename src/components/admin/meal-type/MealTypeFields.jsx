import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from '../../../config/supabase';
import { toast } from "sonner";

const MealTypeFields = ({ 
  mealType, 
  setMealType,
  mealValue,
  setMealValue,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  maxUsersPerDay,
  setMaxUsersPerDay,
  toleranceMinutes,
  setToleranceMinutes,
  mealTypes,
  existingMealData,
  onStatusChange
}) => {
  const handleActiveChange = async (checked) => {
    if (!existingMealData?.id) return;

    try {
      const { error } = await supabase
        .from('tipos_refeicao')
        .update({ ativo: checked })
        .eq('id', existingMealData.id);

      if (error) {
        console.error('Erro ao atualizar status da refeição:', error);
        toast.error("Erro ao atualizar status da refeição");
        return;
      }

      if (onStatusChange) {
        onStatusChange(checked);
      }
      
      toast.success(`Refeição ${checked ? 'ativada' : 'suspensa'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status da refeição:', error);
      toast.error("Erro ao atualizar status da refeição");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="meal-type">Tipo de Refeição</Label>
        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger className="h-9" id="meal-type">
            <SelectValue placeholder="Selecione o tipo de refeição" />
          </SelectTrigger>
          <SelectContent>
            {mealTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="meal-value">Valor (R$)</Label>
          <Input 
            id="meal-value"
            placeholder="0,00" 
            type="number" 
            step="0.01" 
            value={mealValue}
            onChange={(e) => setMealValue(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="max-users">Limite Diário</Label>
          <Input 
            id="max-users"
            placeholder="Nº usuários" 
            type="number" 
            value={maxUsersPerDay}
            onChange={(e) => setMaxUsersPerDay(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {mealType !== "Extra" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="start-time">Início</Label>
            <Input 
              id="start-time"
              placeholder="Horário inicial" 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-time">Término</Label>
            <Input 
              id="end-time"
              placeholder="Horário final" 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="tolerance">Tolerância (minutos)</Label>
        <Input 
          id="tolerance"
          placeholder="Minutos" 
          type="number" 
          value={toleranceMinutes}
          onChange={(e) => setToleranceMinutes(e.target.value)}
          className="h-9"
        />
      </div>

      {existingMealData && (
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="active"
            checked={existingMealData.ativo}
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor="active">Refeição Ativa</Label>
        </div>
      )}
    </>
  );
};

export default MealTypeFields;