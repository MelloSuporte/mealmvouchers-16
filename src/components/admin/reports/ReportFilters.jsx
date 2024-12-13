import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

const ReportFilters = ({ metrics, onFilterChange, startDate, endDate }) => {
  if (!metrics) {
    console.log('Métricas não disponíveis para filtros');
    return null;
  }

  const handleDateChange = (type, date) => {
    console.log(`Alterando data ${type}:`, date);
    if (type === 'startDate' && date > endDate) {
      toast.error("Data inicial não pode ser maior que a data final");
      return;
    }
    if (type === 'endDate' && date < startDate) {
      toast.error("Data final não pode ser menor que a data inicial");
      return;
    }
    onFilterChange(type, date);
  };

  const companies = Object.keys(metrics.byCompany || {});
  const shifts = Object.keys(metrics.byShift || {});
  const mealTypes = Object.keys(metrics.byMealType || {});

  console.log('Dados disponíveis para filtros:', {
    companies,
    shifts,
    mealTypes
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div>
        <label className="text-sm font-medium mb-2 block">Empresa</label>
        <Select onValueChange={(value) => onFilterChange('company', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Data Inicial</label>
        <DatePicker
          date={startDate}
          onDateChange={(date) => handleDateChange('startDate', date)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Data Final</label>
        <DatePicker
          date={endDate}
          onDateChange={(date) => handleDateChange('endDate', date)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Turno</label>
        <Select onValueChange={(value) => onFilterChange('shift', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o turno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {shifts.map((shift) => (
              <SelectItem key={shift} value={shift}>
                {shift}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Tipo de Refeição</label>
        <Select onValueChange={(value) => onFilterChange('mealType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {mealTypes.map((mealType) => (
              <SelectItem key={mealType} value={mealType}>
                {mealType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;