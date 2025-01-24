import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import VoucherTypeSelector from './vouchers/VoucherTypeSelector';
import VoucherTable from './vouchers/VoucherTable';
import { useDisposableVoucherFormLogic } from './vouchers/DisposableVoucherFormLogic';
import { Card, CardContent } from "@/components/ui/card";

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
    personName,
    setPersonName,
    companyName,
    setCompanyName,
    handleMealTypeToggle,
    handleGenerateVouchers
  } = useDisposableVoucherFormLogic();

  console.log('Todos os vouchers:', allVouchers);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando tipos de refeição...</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Nome da Pessoa
                </label>
                <Input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Digite o nome da pessoa"
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Nome da Empresa
                </label>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Digite o nome da empresa"
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Quantidade de Vouchers por Data/Refeição
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-8 text-sm"
                />
              </div>

              <VoucherTypeSelector 
                mealTypes={mealTypes}
                selectedMealTypes={selectedMealTypes}
                onMealTypeToggle={handleMealTypeToggle}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">
                Data para Uso
              </label>
              <div className="border rounded-lg p-2 bg-white">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  className="w-full"
                  locale={ptBR}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  formatters={{
                    formatCaption: (date) => {
                      const month = ptBR.localize.month(date.getMonth());
                      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
                    }
                  }}
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_today: "bg-gray-100 text-gray-900",
                    day: "h-7 w-7 text-xs p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100",
                    head_cell: "text-xs font-medium text-gray-500",
                    caption: "text-sm font-medium",
                    nav_button: "h-6 w-6 bg-transparent hover:bg-gray-100 rounded-full",
                    table: "w-full border-collapse space-y-1",
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleGenerateVouchers}
              disabled={!selectedMealTypes.length || quantity < 1 || !selectedDates.length || !personName || !companyName || isGenerating}
              className="w-full md:w-auto px-8 py-2 text-sm"
            >
              {isGenerating ? 'Gerando...' : 'Gerar Vouchers Descartáveis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <VoucherTable vouchers={allVouchers} />
    </div>
  );
};

export default DisposableVoucherForm;