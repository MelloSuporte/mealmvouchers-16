import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMeals, toggleMealActive } from './mealMutations';
import { MealListTable } from './MealListTable';
import { supabase } from '../../../config/supabase';

const MealScheduleList = () => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  const queryClient = useQueryClient();

  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .order('nome');

      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: toggleMealActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  const deleteMealsMutation = useMutation({
    mutationFn: deleteMeals,
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
      <MealListTable 
        meals={meals}
        selectedMeals={selectedMeals}
        onSelectMeal={handleSelectMeal}
        onSelectAll={handleSelectAll}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
};

export default MealScheduleList;