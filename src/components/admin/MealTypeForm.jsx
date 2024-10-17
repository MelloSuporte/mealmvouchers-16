import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MealTypeForm = () => {
  const [mealType, setMealType] = useState("");
  const [mealValue, setMealValue] = useState("");

  const handleSaveMealType = () => {
    console.log('Salvando tipo de refeição:', { mealType, mealValue });
    // Aqui você implementaria a lógica para salvar os dados do tipo de refeição
    setMealType("");
    setMealValue("");
  };

  return (
    <form className="space-y-4">
      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de refeição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Almoço">Almoço</SelectItem>
          <SelectItem value="Café">Café</SelectItem>
          <SelectItem value="Lanche">Lanche</SelectItem>
          <SelectItem value="Jantar">Jantar</SelectItem>
          <SelectItem value="Ceia">Ceia</SelectItem>
          <SelectItem value="Extra">Extra</SelectItem>
        </SelectContent>
      </Select>
      <Input 
        placeholder="Valor da refeição" 
        type="number" 
        step="0.01" 
        value={mealValue}
        onChange={(e) => setMealValue(e.target.value)}
      />
      <Button type="button" onClick={handleSaveMealType}>Cadastrar Tipo de Refeição</Button>
    </form>
  );
};

export default MealTypeForm;