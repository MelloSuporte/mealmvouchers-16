import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';

const MealRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealData, setMealData] = useState({
    nome: '',
    valor: '',
    ativo: true
  });

  const handleInputChange = (field, value) => {
    if (field === 'valor') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = (numericValue / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      setMealData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setMealData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!mealData.nome || !mealData.valor) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const numericValue = parseFloat(mealData.valor.replace(/[^0-9,]/g, '').replace(',', '.'));
      
      const { data, error } = await supabase
        .from('refeicoes')
        .insert([{
          nome: mealData.nome,
          valor: numericValue,
          ativo: mealData.ativo
        }])
        .select();

      if (error) throw error;
      
      toast.success("Refeição cadastrada com sucesso!");
      setMealData({
        nome: '',
        valor: '',
        ativo: true
      });
    } catch (error) {
      console.error('Erro ao cadastrar refeição:', error);
      toast.error("Erro ao cadastrar refeição: " + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Refeição</Label>
        <Input
          id="nome"
          value={mealData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Ex: Almoço"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input
          id="valor"
          value={mealData.valor}
          onChange={(e) => handleInputChange('valor', e.target.value)}
          placeholder="R$ 0,00"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={mealData.ativo}
          onCheckedChange={(checked) => handleInputChange('ativo', checked)}
          disabled={isSubmitting}
        />
        <Label htmlFor="ativo">Refeição Ativa</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Refeição'}
      </Button>
    </form>
  );
};

export default MealRegistrationForm;