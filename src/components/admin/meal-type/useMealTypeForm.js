import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { toast } from "sonner";

export const useMealTypeForm = () => {
  const [mealType, setMealType] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxUsersPerDay, setMaxUsersPerDay] = useState("");
  const [toleranceMinutes, setToleranceMinutes] = useState("15");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMealData, setExistingMealData] = useState(null);

  const { data: mealTypes = [], refetch: refetchMealTypes } = useQuery({
    queryKey: ['meal-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('nome')
        .order('nome');
      
      if (error) throw error;
      return data.map(type => type.nome);
    }
  });

  const handleMealTypeSelect = async (selectedType) => {
    setMealType(selectedType);
    
    if (!selectedType) {
      // Clear form for new meal type
      setExistingMealData(null);
      setMealValue('');
      setStartTime('');
      setEndTime('');
      setMaxUsersPerDay('');
      setToleranceMinutes('15');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('nome', selectedType)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingMealData(data);
        setMealValue(data.valor.toString());
        setStartTime(data.horario_inicio || '');
        setEndTime(data.horario_fim || '');
        setMaxUsersPerDay(data.max_usuarios_por_dia?.toString() || '');
        setToleranceMinutes(data.minutos_tolerancia?.toString() || '15');
        toast.success("Dados da refeição carregados");
      }
    } catch (error) {
      console.error('Erro ao carregar dados da refeição:', error);
      toast.error("Erro ao carregar dados da refeição");
    }
  };

  const handleSaveMealType = async () => {
    if (!mealType || !mealValue || (mealType !== "Extra" && (!startTime || !endTime))) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
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

      toast.success(`Tipo de refeição ${existingMealData ? 'atualizado' : 'cadastrado'} com sucesso!`);
      
      // Clear form
      setMealType("");
      setMealValue("");
      setStartTime("");
      setEndTime("");
      setMaxUsersPerDay("");
      setToleranceMinutes("15");
      setExistingMealData(null);
      
      // Refresh meal types list
      refetchMealTypes();
    } catch (error) {
      console.error('Erro ao salvar tipo de refeição:', error);
      toast.error("Erro ao salvar tipo de refeição: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (existingMealData) {
      setExistingMealData({
        ...existingMealData,
        ativo: newStatus
      });
    }
  };

  return {
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
    isSubmitting,
    handleSaveMealType,
    handleStatusChange,
    handleMealTypeSelect
  };
};