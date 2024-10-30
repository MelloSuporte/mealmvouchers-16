import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from '../../../utils/api';

const MealScheduleList = () => {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await api.get('/api/meals');
      setMeals(response.data);
    } catch (error) {
      toast.error("Erro ao carregar refeições: " + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/api/meals/${id}`, { 
        is_active: !currentStatus 
      });
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
              <TableCell>{meal.name}</TableCell>
              <TableCell>{meal.start_time} - {meal.end_time}</TableCell>
              <TableCell>R$ {parseFloat(meal.value).toFixed(2)}</TableCell>
              <TableCell>{meal.max_users_per_day || 'Sem limite'}</TableCell>
              <TableCell>{meal.tolerance_minutes} min</TableCell>
              <TableCell>
                <Switch
                  checked={meal.is_active}
                  onCheckedChange={() => handleToggleActive(meal.id, meal.is_active)}
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