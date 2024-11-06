import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../../utils/api';

const MealScheduleForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealSchedule, setMealSchedule] = useState({
    name: '',
    startTime: '',
    endTime: '',
    value: '',
    isActive: true,
    maxUsersPerDay: '',
    toleranceMinutes: '15'
  });

  const handleInputChange = (field, value) => {
    if (field === 'value') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = (numericValue / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      setMealSchedule(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setMealSchedule(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!mealSchedule.name || !mealSchedule.startTime || !mealSchedule.endTime || !mealSchedule.value) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }

    const start = new Date(`2000-01-01T${mealSchedule.startTime}`);
    const end = new Date(`2000-01-01T${mealSchedule.endTime}`);
    
    if (end <= start) {
      toast.error("O horário de término deve ser posterior ao horário de início");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const numericValue = parseFloat(mealSchedule.value.replace(/[^0-9,]/g, '').replace(',', '.'));
      
      const response = await api.post('/meals', {
        ...mealSchedule,
        value: numericValue
      });
      
      if (response.data.success) {
        toast.success("Refeição cadastrada com sucesso!");
        setMealSchedule({
          name: '',
          startTime: '',
          endTime: '',
          value: '',
          isActive: true,
          maxUsersPerDay: '',
          toleranceMinutes: '15'
        });
      }
    } catch (error) {
      toast.error("Erro ao cadastrar refeição: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Refeição</Label>
        <Input
          id="name"
          value={mealSchedule.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ex: Almoço"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Horário Início</Label>
          <Input
            id="startTime"
            type="time"
            value={mealSchedule.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Horário Fim</Label>
          <Input
            id="endTime"
            type="time"
            value={mealSchedule.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valor (R$)</Label>
        <Input
          id="value"
          value={mealSchedule.value}
          onChange={(e) => handleInputChange('value', e.target.value)}
          placeholder="R$ 0,00"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUsersPerDay">Limite de Usuários por Dia</Label>
        <Input
          id="maxUsersPerDay"
          type="number"
          value={mealSchedule.maxUsersPerDay}
          onChange={(e) => handleInputChange('maxUsersPerDay', e.target.value)}
          placeholder="Sem limite"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toleranceMinutes">Tolerância (minutos)</Label>
        <Input
          id="toleranceMinutes"
          type="number"
          value={mealSchedule.toleranceMinutes}
          onChange={(e) => handleInputChange('toleranceMinutes', e.target.value)}
          placeholder="15"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={mealSchedule.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
          disabled={isSubmitting}
        />
        <Label htmlFor="isActive">Refeição Ativa</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Refeição'}
      </Button>
    </form>
  );
};

export default MealScheduleForm;