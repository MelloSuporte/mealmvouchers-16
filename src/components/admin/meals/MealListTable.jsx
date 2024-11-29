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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedMeals.length === meals.length}
                onCheckedChange={onSelectAll}
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
                  onCheckedChange={() => onSelectMeal(meal.id)}
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
                  onCheckedChange={() => onToggleActive(meal.id, meal.ativo)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};