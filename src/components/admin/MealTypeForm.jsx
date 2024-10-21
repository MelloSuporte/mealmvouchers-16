import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const MealTypeForm = () => {
  const [mealType, setMealType] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const mealTypes = [
    "Café (1)", "Café (2)", "Almoço", "Lanche", "Jantar", "Ceia", "Desjejum", "Extra"
  ];

  const handleSaveMealType = () => {
    if (!mealType || !mealValue || (mealType !== "Extra" && (!startTime || !endTime))) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    console.log('Salvando tipo de refeição:', { mealType, mealValue, startTime, endTime });
    // Aqui você implementaria a lógica para salvar os dados do tipo de refeição
    toast.success(`Tipo de refeição ${mealType} salvo com sucesso!`);
    setMealType("");
    setMealValue("");
    setStartTime("");
    setEndTime("");
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
            placeholder="Horário de término" 
            type="time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </>
      )}
      <Button type="button" onClick={handleSaveMealType}>Cadastrar Tipo de Refeição</Button>
    </form>
  );
};

export default MealTypeForm;