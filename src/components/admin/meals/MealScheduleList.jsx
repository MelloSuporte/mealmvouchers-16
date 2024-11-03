import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from '../../../utils/api';
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

const MealScheduleList = () => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeals, setSelectedMeals] = useState([]);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/meals');
      setMeals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Erro ao carregar refeições: " + error.message);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/meals/${id}`, { 
        is_active: !currentStatus 
      });
      await loadMeals();
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const handleSelectMeal = (mealId) => {
    setSelectedMeals(prev => {
      if (prev.includes(mealId)) {
        return prev.filter(id => id !== mealId);
      }
      return [...prev, mealId];
    });
  };

  const handleSelectAll = () => {
    if (selectedMeals.length === meals.length) {
      setSelectedMeals([]);
    } else {
      setSelectedMeals(meals.map(meal => meal.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMeals.length === 0) {
      toast.error("Selecione pelo menos uma refeição para excluir");
      return;
    }

    try {
      await Promise.all(selectedMeals.map(id => api.delete(`/meals/${id}`)));
      toast.success("Refeições selecionadas excluídas com sucesso!");
      setSelectedMeals([]);
      await loadMeals();
    } catch (error) {
      toast.error("Erro ao excluir refeições: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhuma refeição cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedMeals.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Excluir Selecionados ({selectedMeals.length})
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedMeals.length === meals.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                <TableCell>
                  <Checkbox
                    checked={selectedMeals.includes(meal.id)}
                    onCheckedChange={() => handleSelectMeal(meal.id)}
                  />
                </TableCell>
                <TableCell>{meal.name}</TableCell>
                <TableCell>{meal.start_time} - {meal.end_time}</TableCell>
                <TableCell>
                  {parseFloat(meal.value).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
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
    </div>
  );
};

export default MealScheduleList;