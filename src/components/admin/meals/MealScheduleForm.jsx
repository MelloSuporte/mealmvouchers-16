import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { mealTypesApi } from '@/services/api';

const MealScheduleForm = () => {
  const [mealSchedule, setMealSchedule] = useState({
    nome: "",
    hora_inicio: "",
    hora_fim: "",
    valor: "",
    ativo: true,
    max_usuarios_por_dia: "",
    tolerancia_minutos: "15"
  });

  const handleInputChange = (field, value) => {
    setMealSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mealSchedule.nome || !mealSchedule.hora_inicio || !mealSchedule.hora_fim || !mealSchedule.valor) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      await mealTypesApi.create(mealSchedule);
      toast.success("Refeição cadastrada com sucesso!");
      setMealSchedule({
        nome: "",
        hora_inicio: "",
        hora_fim: "",
        valor: "",
        ativo: true,
        max_usuarios_por_dia: "",
        tolerancia_minutos: "15"
      });
    } catch (error) {
      toast.error("Erro ao cadastrar refeição: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Refeição</Label>
        <Input
          id="nome"
          value={mealSchedule.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Ex: Almoço"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_inicio">Horário Início</Label>
          <Input
            id="hora_inicio"
            type="time"
            value={mealSchedule.hora_inicio}
            onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_fim">Horário Fim</Label>
          <Input
            id="hora_fim"
            type="time"
            value={mealSchedule.hora_fim}
            onChange={(e) => handleInputChange('hora_fim', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={mealSchedule.valor}
          onChange={(e) => handleInputChange('valor', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_usuarios_por_dia">Limite de Usuários por Dia</Label>
        <Input
          id="max_usuarios_por_dia"
          type="number"
          value={mealSchedule.max_usuarios_por_dia}
          onChange={(e) => handleInputChange('max_usuarios_por_dia', e.target.value)}
          placeholder="Sem limite"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tolerancia_minutos">Tolerância (minutos)</Label>
        <Input
          id="tolerancia_minutos"
          type="number"
          value={mealSchedule.tolerancia_minutos}
          onChange={(e) => handleInputChange('tolerancia_minutos', e.target.value)}
          placeholder="15"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={mealSchedule.ativo}
          onCheckedChange={(checked) => handleInputChange('ativo', checked)}
        />
        <Label htmlFor="ativo">Refeição Ativa</Label>
      </div>

      <Button type="submit" className="w-full">
        Cadastrar Refeição
      </Button>
    </form>
  );
};

export default MealScheduleForm;