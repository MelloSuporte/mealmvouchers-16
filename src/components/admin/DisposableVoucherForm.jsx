import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import VoucherTypeSelector from './vouchers/VoucherTypeSelector';
import VoucherTable from './vouchers/VoucherTable';
import { useDisposableVoucherForm } from './vouchers/DisposableVoucherFormLogic';

const DisposableVoucherForm = () => {
  const {
    quantity,
    setQuantity,
    selectedMealTypes,
    selectedDates,
    setSelectedDates,
    mealTypes,
    isLoading,
    isGenerating,
    allVouchers,
    handleMealTypeToggle,
    handleGenerateVouchers
  } = useDisposableVoucherForm();

  if (isLoading) {
    return <div>Carregando tipos de refeição...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade de Vouchers por Data/Refeição</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>

      <VoucherTypeSelector 
        mealTypes={mealTypes}
        selectedMealTypes={selectedMealTypes}
        onMealTypeToggle={handleMealTypeToggle}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Datas de Expiração</label>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
          formatters={{
            formatCaption: (date) => {
              const month = ptBR.localize.month(date.getMonth());
              return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
            }
          }}
        />
        <p className="text-sm text-gray-500">
          {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleGenerateVouchers}
          disabled={!selectedMealTypes.length || quantity < 1 || !selectedDates.length || isGenerating}
          className="px-6"
        >
          {isGenerating ? 'Gerando...' : 'Gerar Vouchers Descartáveis'}
        </Button>
      </div>

      <VoucherTable vouchers={allVouchers} />
    </div>
  );
};

export default DisposableVoucherForm;