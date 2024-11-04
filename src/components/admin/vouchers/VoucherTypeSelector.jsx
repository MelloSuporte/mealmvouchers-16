import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const VoucherTypeSelector = ({ mealTypes, selectedMealTypes, onMealTypeToggle }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tipos de Refeição</label>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-2">
          {mealTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`meal-type-${type.id}`}
                checked={selectedMealTypes.includes(type.id)}
                onCheckedChange={() => onMealTypeToggle(type.id)}
              />
              <Label htmlFor={`meal-type-${type.id}`}>{type.name}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VoucherTypeSelector;