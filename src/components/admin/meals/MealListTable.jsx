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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectedMeals.length === meals.length && meals.length > 0}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Horário Início</TableHead>
          <TableHead>Horário Fim</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meals.map((meal) => (
          <TableRow key={meal.id}>
            <TableCell>
              <Checkbox 
                checked={selectedMeals.includes(meal.id)}
                onCheckedChange={() => onSelectMeal(meal.id)}
              />
            </TableCell>
            <TableCell>{meal.nome}</TableCell>
            <TableCell>R$ {meal.valor.toFixed(2)}</TableCell>
            <TableCell>{meal.hora_inicio || '-'}</TableCell>
            <TableCell>{meal.hora_fim || '-'}</TableCell>
            <TableCell className="text-right">
              <Switch 
                checked={meal.ativo}
                onCheckedChange={() => onToggleActive(meal.id, !meal.ativo)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};