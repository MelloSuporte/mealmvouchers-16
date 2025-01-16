import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VoucherTypeFilter = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Voucher</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="comum">Comum</SelectItem>
          <SelectItem value="descartavel">Descartável</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoucherTypeFilter;