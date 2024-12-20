import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

const CompanyDateFilters = ({ 
  filterOptions, 
  handleFilterChange, 
  startDate, 
  endDate 
}) => {
  const handleDateChange = (type, date) => {
    try {
      console.log(`Alterando data ${type}:`, date);
      
      if (!date || isNaN(date.getTime())) {
        toast.error("Data inválida");
        return;
      }

      handleFilterChange(type, date);
    } catch (error) {
      console.error('Erro ao alterar data:', error);
      toast.error('Erro ao atualizar data');
    }
  };

  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-2 block">Empresa</Label>
        <Select onValueChange={(value) => handleFilterChange('company', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions?.empresas?.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Inicial</Label>
        <DatePicker
          date={startDate}
          onDateChange={(date) => handleDateChange('startDate', date)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Final</Label>
        <DatePicker
          date={endDate}
          onDateChange={(date) => handleDateChange('endDate', date)}
        />
      </div>
    </>
  );
};

export default CompanyDateFilters;