import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const VoucherTypeSelector = ({ mealTypes, selectedMealTypes, onMealTypeToggle }) => {
  if (!mealTypes || mealTypes.length === 0) {
    return <div className="text-sm text-gray-500">Nenhum tipo de refeição disponível</div>;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-700">Tipos de Refeição</Label>
      <Card className="shadow-sm">
        <CardContent className="p-3 grid gap-2">
          {mealTypes.map((mealType) => (
            <div key={mealType.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
              <Checkbox
                id={`meal-type-${mealType.id}`}
                checked={selectedMealTypes.includes(mealType.id)}
                onCheckedChange={() => onMealTypeToggle(mealType.id)}
                className="h-4 w-4"
              />
              <Label
                htmlFor={`meal-type-${mealType.id}`}
                className="text-xs text-gray-700 cursor-pointer"
              >
                {mealType.nome} - R$ {(mealType.valor ?? 0).toFixed(2)}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherTypeSelector;