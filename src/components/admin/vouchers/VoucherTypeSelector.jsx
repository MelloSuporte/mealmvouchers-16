import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const VoucherTypeSelector = ({ mealTypes, selectedMealTypes, onMealTypeToggle }) => {
  if (!mealTypes || mealTypes.length === 0) {
    return <div>Nenhum tipo de refeição disponível</div>;
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tipos de Refeição</Label>
      <div className="grid gap-4">
        {mealTypes.map((mealType) => (
          <div key={mealType.id} className="flex items-center space-x-2">
            <Checkbox
              id={`meal-type-${mealType.id}`}
              checked={selectedMealTypes.includes(mealType.id)}
              onCheckedChange={() => onMealTypeToggle(mealType.id)}
            />
            <Label
              htmlFor={`meal-type-${mealType.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {mealType.nome} - R$ {mealType.valor.toFixed(2)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherTypeSelector;