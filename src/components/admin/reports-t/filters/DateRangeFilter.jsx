import React from 'react';
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker";

const DateRangeFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="space-y-2">
      <Label>Período</Label>
      <DatePickerWithRange 
        date={{
          from: filters.startDate,
          to: filters.endDate
        }}
        onSelect={(range) => {
          onFilterChange('startDate', range?.from);
          onFilterChange('endDate', range?.to);
        }}
      />
    </div>
  );
};

export default DateRangeFilter;