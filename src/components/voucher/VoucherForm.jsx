import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoucherNumpad from './VoucherNumpad';

const VoucherForm = ({
  voucherCode,
  onSubmit,
  onNumpadClick,
  onBackspace,
  isValidating,
  mealTypes,
  selectedMealType,
  onMealTypeChange
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Refeição
          </label>
          <Select
            value={selectedMealType?.id || ''}
            onValueChange={(value) => {
              const mealType = mealTypes.find(mt => mt.id === value);
              onMealTypeChange(mealType);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo de refeição" />
            </SelectTrigger>
            <SelectContent>
              {mealTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código do Voucher
          </label>
          <input
            type="text"
            value={voucherCode}
            readOnly
            className="w-full p-4 text-center text-2xl font-mono bg-gray-100 border border-gray-300 rounded-lg"
            maxLength={4}
          />
        </div>

        <VoucherNumpad
          onNumClick={onNumpadClick}
          onBackspace={onBackspace}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={voucherCode.length !== 4 || !selectedMealType || isValidating}
        >
          {isValidating ? 'Validando...' : 'Validar Voucher'}
        </Button>
      </div>
    </form>
  );
};

export default VoucherForm;