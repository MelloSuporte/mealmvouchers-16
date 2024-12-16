import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '../../config/supabase';
import MealTypeFields from './meal-type/MealTypeFields';

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
          if (error.code === '42501') {
            toast.error("Erro de permissão: Você não tem acesso a esta funcionalidade");
            return;
          }
          console.error('Erro na consulta:', error);
          toast.error("Erro ao buscar dados da refeição: " + error.message);
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
          toast.success("Dados da refeição carregados com sucesso!");
        } else {
          console.log('Nenhum dado encontrado para:', mealType);
          setExistingMealData(null);
          setMealValue('');
          setStartTime('');
          setEndTime('');
          setMaxUsersPerDay('');
          setToleranceMinutes('15');
          toast.info("Nova refeição - preencha os dados necessários");
        }
      } catch (error) {
        console.error('Erro ao buscar dados da refeição:', error);
        toast.error("Erro ao buscar dados da refeição. Por favor, tente novamente.");
        setExistingMealData(null);
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
      
      if (error) {
        if (error.code === '42501') {
          toast.error("Erro de permissão: Você não tem acesso para salvar tipos de refeição");
          return;
        }
        throw error;
      }

      toast.success(`Tipo de refeição ${mealType} ${existingMealData ? 'atualizado' : 'salvo'} com sucesso!`);
      
      // Limpar formulário após salvar
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
    <form className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Configuração de Refeição</h2>
      
      <MealTypeFields 
        mealType={mealType}
        setMealType={setMealType}
        mealValue={mealValue}
        setMealValue={setMealValue}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        maxUsersPerDay={maxUsersPerDay}
        setMaxUsersPerDay={setMaxUsersPerDay}
        toleranceMinutes={toleranceMinutes}
        setToleranceMinutes={setToleranceMinutes}
        mealTypes={mealTypes}
      />

      <Button 
        type="button" 
        onClick={handleSaveMealType}
        disabled={isSubmitting}
        className="w-full h-9 mt-6"
        variant="default"
        size="sm"
      >
        {isSubmitting ? 'Salvando...' : existingMealData ? 'Atualizar Refeição' : 'Cadastrar Refeição'}
      </Button>
    </form>
  );
};

export default MealTypeForm;