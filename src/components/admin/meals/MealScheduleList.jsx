import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { mealTypesApi } from '@/services/api';

const MealScheduleList = () => {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const result = await mealTypesApi.getAll();
      setMeals(result);
    } catch (error) {
      toast.error("Erro ao carregar refeições: " + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await mealTypesApi.update(id, { isActive: !currentStatus });
      await loadMeals();
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Refeição</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Limite/Dia</TableHead>
            <TableHead>Tolerância</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <TableRow key={meal.id}>
              <TableCell>{meal.nome}</TableCell>
              <TableCell>{meal.hora_inicio} - {meal.hora_fim}</TableCell>
              <TableCell>R$ {parseFloat(meal.valor).toFixed(2)}</TableCell>
              <TableCell>{meal.max_usuarios_por_dia || 'Sem limite'}</TableCell>
              <TableCell>{meal.tolerancia_minutos} min</TableCell>
              <TableCell>
                <Switch
                  checked={meal.ativo}
                  onCheckedChange={() => handleToggleActive(meal.id, meal.ativo)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MealScheduleList;