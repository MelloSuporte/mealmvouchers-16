import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';

const ExtraMealForm = () => {
  const [mealName, setMealName] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mealName || !mealValue) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from('refeicoes')
        .insert([
          {
            nome: mealName,
            valor: parseFloat(mealValue),
            ativo: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar refeição:', error);
        toast.error("Erro ao salvar refeição");
        return;
      }

      toast.success("Refeição cadastrada com sucesso!");
      setMealName("");
      setMealValue("");

    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error("Erro ao salvar refeição");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Nome da Refeição</Label>
            <Input
              id="meal-name"
              placeholder="Digite o nome da refeição"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-value">Valor (R$)</Label>
            <Input
              id="meal-value"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={mealValue}
              onChange={(e) => setMealValue(e.target.value)}
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Cadastrar Refeição"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExtraMealForm;