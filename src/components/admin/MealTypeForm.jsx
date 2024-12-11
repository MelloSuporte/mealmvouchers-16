import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from '../../config/supabase';

const MealTypeForm = () => {
  const [mealType, setMealType] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxUsersPerDay, setMaxUsersPerDay] = useState("");
  const [toleranceMinutes, setToleranceMinutes] = useState("15");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMealData, setExistingMealData] = useState(null);

  const mealTypes = [
    "Café (1)", "Café (2)", "Almoço", "Lanche", "Jantar", "Ceia", "Refeição Matinal", "Extra"
  ];

  useEffect(() => {
    const fetchExistingMealData = async () => {
      if (!mealType) {
        setExistingMealData(null);
        return;
      }

      try {
        console.log('Buscando dados para o tipo de refeição:', mealType);
        
        const { data, error } = await supabase
          .from('tipos_refeicao')
          .select('*')
          .eq('nome', mealType)
          .maybeSingle();

        if (error) {
          console.error('Erro na consulta:', error);
          throw error;
        }

        if (data) {
          console.log('Dados encontrados:', data);
          setExistingMealData(data);
          setMealValue(data.valor.toString());
          setStartTime(data.horario_inicio || '');
          setEndTime(data.horario_fim || '');
          setMaxUsersPerDay(data.max_usuarios_por_dia?.toString() || '');
          setToleranceMinutes(data.minutos_tolerancia?.toString() || '15');
        } else {
          console.log('Nenhum dado encontrado para:', mealType);
          setExistingMealData(null);
          setMealValue('');
          setStartTime('');
          setEndTime('');
          setMaxUsersPerDay('');
          setToleranceMinutes('15');
        }
      } catch (error) {
        console.error('Erro ao buscar dados da refeição:', error);
        toast.error("Erro ao buscar dados da refeição. Por favor, tente novamente.");
        setExistingMealData(null);
        setMealValue('');
        setStartTime('');
        setEndTime('');
        setMaxUsersPerDay('');
        setToleranceMinutes('15');
      }
    };

    fetchExistingMealData();
  }, [mealType]);

  const handleSaveMealType = async () => {
    if (!mealType || !mealValue || (mealType !== "Extra" && (!startTime || !endTime))) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const mealData = {
        nome: mealType,
        valor: parseFloat(mealValue),
        horario_inicio: startTime || null,
        horario_fim: endTime || null,
        ativo: true,
        max_usuarios_por_dia: maxUsersPerDay ? parseInt(maxUsersPerDay) : null,
        minutos_tolerancia: parseInt(toleranceMinutes) || 15
      };

      let operation;
      if (existingMealData) {
        operation = supabase
          .from('tipos_refeicao')
          .update(mealData)
          .eq('id', existingMealData.id);
      } else {
        operation = supabase
          .from('tipos_refeicao')
          .insert([mealData]);
      }

      const { error } = await operation;
      if (error) throw error;

      toast.success(`Tipo de refeição ${mealType} ${existingMealData ? 'atualizado' : 'salvo'} com sucesso!`);
      setMealType("");
      setMealValue("");
      setStartTime("");
      setEndTime("");
      setMaxUsersPerDay("");
      setToleranceMinutes("15");
      setExistingMealData(null);
    } catch (error) {
      console.error('Erro ao salvar tipo de refeição:', error);
      toast.error("Erro ao salvar tipo de refeição: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4">
      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de refeição" />
        </SelectTrigger>
        <SelectContent>
          {mealTypes.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input 
        placeholder="Valor da refeição" 
        type="number" 
        step="0.01" 
        value={mealValue}
        onChange={(e) => setMealValue(e.target.value)}
      />

      {mealType !== "Extra" && (
        <>
          <Input 
            placeholder="Horário de início" 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input 
            placeholder="Horário de fim" 
            type="time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </>
      )}

      <Input 
        placeholder="Limite de usuários por dia (opcional)" 
        type="number" 
        value={maxUsersPerDay}
        onChange={(e) => setMaxUsersPerDay(e.target.value)}
      />

      <Input 
        placeholder="Minutos de tolerância" 
        type="number" 
        value={toleranceMinutes}
        onChange={(e) => setToleranceMinutes(e.target.value)}
      />

      <Button 
        type="button" 
        onClick={handleSaveMealType}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Salvando...' : existingMealData ? 'Atualizar Tipo de Refeição' : 'Cadastrar Tipo de Refeição'}
      </Button>
    </form>
  );
};

export default MealTypeForm;