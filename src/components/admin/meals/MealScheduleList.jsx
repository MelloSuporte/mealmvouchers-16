import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from '../../../utils/api';
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MealScheduleList = () => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  const queryClient = useQueryClient();

  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/refeicoes');
        console.log('Meals response:', response.data); // Debug log
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching meals:', error);
        toast.error('Erro ao carregar refeições: ' + error.message);
        return [];
      }
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      await api.patch(`/api/refeicoes/${id}`, { ativo: !currentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  const deleteMealsMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => api.delete(`/api/refeicoes/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
      setSelectedMeals([]);
      toast.success("Refeições selecionadas excluídas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir refeições: " + error.message);
    }
  });

  const handleToggleActive = (id, currentStatus) => {
    toggleActiveMutation.mutate({ id, currentStatus });
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

  const handleDeleteSelected = () => {
    if (selectedMeals.length === 0) {
      toast.error("Selecione pelo menos uma refeição para excluir");
      return;
    }

    deleteMealsMutation.mutate(selectedMeals);
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Erro ao carregar refeições: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!Array.isArray(meals) || meals.length === 0) {
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
            disabled={deleteMealsMutation.isLoading}
          >
            <Trash2 size={16} />
            {deleteMealsMutation.isLoading 
              ? 'Excluindo...' 
              : `Excluir Selecionados (${selectedMeals.length})`}
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
                <TableCell>{meal.nome}</TableCell>
                <TableCell>{meal.hora_inicio} - {meal.hora_fim}</TableCell>
                <TableCell>
                  {parseFloat(meal.valor).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell>{meal.max_usuarios_por_dia || 'Sem limite'}</TableCell>
                <TableCell>{meal.minutos_tolerancia} min</TableCell>
                <TableCell>
                  <Switch
                    checked={meal.ativo}
                    onCheckedChange={() => handleToggleActive(meal.id, meal.ativo)}
                    disabled={toggleActiveMutation.isLoading}
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