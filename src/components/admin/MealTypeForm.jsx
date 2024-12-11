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
    "Breakfast (1)", "Breakfast (2)", "Lunch", "Snack", "Dinner", "Supper", "Morning Meal", "Extra"
  ];

  useEffect(() => {
    const fetchExistingMealData = async () => {
      if (!mealType) {
        setExistingMealData(null);
        return;
      }

      try {
        console.log('Fetching data for meal type:', mealType);
        
        const { data, error } = await supabase
          .from('tipos_refeicao')
          .select('*')
          .eq('nome', mealType)
          .maybeSingle();

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        if (data) {
          console.log('Data found:', data);
          setExistingMealData(data);
          setMealValue(data.valor.toString());
          setStartTime(data.horario_inicio || '');
          setEndTime(data.horario_fim || '');
          setMaxUsersPerDay(data.max_usuarios_por_dia?.toString() || '');
          setToleranceMinutes(data.minutos_tolerancia?.toString() || '15');
        } else {
          console.log('No data found for:', mealType);
          // Reset form for new entry
          setExistingMealData(null);
          setMealValue('');
          setStartTime('');
          setEndTime('');
          setMaxUsersPerDay('');
          setToleranceMinutes('15');
        }
      } catch (error) {
        console.error('Error fetching meal data:', error);
        toast.error("Error fetching meal data. Please try again.");
        // Reset form on error
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
      toast.error("Please fill in all required fields.");
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

      toast.success(`Meal type ${mealType} ${existingMealData ? 'updated' : 'saved'} successfully!`);
      setMealType("");
      setMealValue("");
      setStartTime("");
      setEndTime("");
      setMaxUsersPerDay("");
      setToleranceMinutes("15");
      setExistingMealData(null);
    } catch (error) {
      console.error('Error saving meal type:', error);
      toast.error("Error saving meal type: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4">
      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger>
          <SelectValue placeholder="Select meal type" />
        </SelectTrigger>
        <SelectContent>
          {mealTypes.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input 
        placeholder="Meal value" 
        type="number" 
        step="0.01" 
        value={mealValue}
        onChange={(e) => setMealValue(e.target.value)}
      />

      {mealType !== "Extra" && (
        <>
          <Input 
            placeholder="Start time" 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input 
            placeholder="End time" 
            type="time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </>
      )}

      <Input 
        placeholder="Users limit per day (optional)" 
        type="number" 
        value={maxUsersPerDay}
        onChange={(e) => setMaxUsersPerDay(e.target.value)}
      />

      <Input 
        placeholder="Tolerance minutes" 
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
        {isSubmitting ? 'Saving...' : existingMealData ? 'Update Meal Type' : 'Register Meal Type'}
      </Button>
    </form>
  );
};

export default MealTypeForm;