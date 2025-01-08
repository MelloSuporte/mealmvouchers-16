import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export const MealListTable = ({ 
  meals, 
  selectedMeals, 
  onSelectMeal, 
  onSelectAll, 
  onToggleActive 
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10 p-2">
              <Checkbox 
                checked={selectedMeals.length === meals.length && meals.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Valor</TableHead>
            <TableHead className="font-semibold">Início</TableHead>
            <TableHead className="font-semibold">Fim</TableHead>
            <TableHead className="text-right w-20 font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <TableRow 
              key={meal.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="p-2">
                <Checkbox 
                  checked={selectedMeals.includes(meal.id)}
                  onCheckedChange={() => onSelectMeal(meal.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{meal.nome}</TableCell>
              <TableCell>{formatCurrency(meal.valor)}</TableCell>
              <TableCell>{meal.hora_inicio || '-'}</TableCell>
              <TableCell>{meal.hora_fim || '-'}</TableCell>
              <TableCell className="text-right">
                <Switch 
                  checked={meal.ativo}
                  onCheckedChange={() => onToggleActive(meal.id, !meal.ativo)}
                  className="data-[state=checked]:bg-green-500"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};