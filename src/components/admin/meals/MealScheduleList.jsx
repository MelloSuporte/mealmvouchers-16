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
import { supabase } from '../../../config/supabase';

const MealScheduleList = () => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  const queryClient = useQueryClient();

  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ['tipos_refeicao'],
    queryFn: async () => {
      console.log('Iniciando busca de tipos de refeição...');
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar tipos de refeição:', error);
        throw error;
      }
      
      console.log('Tipos de refeição encontrados:', data);
      return data || [];
    },
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true
  });

  const toggleActiveMutation = useMutation({
    mutationFn: toggleMealActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['tipos_refeicao']);
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao alterar status da refeição:', error);
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  const deleteMealsMutation = useMutation({
    mutationFn: deleteMeals,
    onSuccess: () => {
      queryClient.invalidateQueries(['tipos_refeicao']);
      setSelectedMeals([]);
      toast.success("Refeições selecionadas excluídas com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao excluir refeições:', error);
      toast.error("Erro ao excluir refeições: " + error.message);
    }
  });

  const handleToggleActive = (id, currentStatus) => {
    console.log('Alterando status da refeição:', { id, currentStatus });
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

  if (!meals || meals.length === 0) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedMeals.length === meals.length && meals.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Horário Início</TableHead>
            <TableHead>Horário Fim</TableHead>
            <TableHead>Max. Usuários/Dia</TableHead>
            <TableHead>Min. Tolerância</TableHead>
            <TableHead className="text-right">Status</TableHead>
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
              <TableCell>R$ {meal.valor.toFixed(2)}</TableCell>
              <TableCell>{meal.hora_inicio || '-'}</TableCell>
              <TableCell>{meal.hora_fim || '-'}</TableCell>
              <TableCell>{meal.max_usuarios_por_dia || '-'}</TableCell>
              <TableCell>{meal.minutos_tolerancia || '-'}</TableCell>
              <TableCell className="text-right">
                <Switch 
                  checked={meal.ativo}
                  onCheckedChange={() => handleToggleActive(meal.id, !meal.ativo)}
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