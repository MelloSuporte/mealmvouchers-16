import React from 'react';
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "lucide-react";

const VoucherNumpad = ({ onNumpadClick, onBackspace, voucherCode = '', disabled }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {numbers.map((number) => (
        <Button
          key={number}
          onClick={() => onNumpadClick(number)}
          disabled={disabled || voucherCode.length >= 4}
          variant="outline"
          className="h-12 text-lg font-semibold"
        >
          {number}
        </Button>
      ))}
      <Button
        onClick={onBackspace}
        disabled={disabled || voucherCode.length === 0}
        variant="outline"
        className="h-12 col-span-3"
      >
        <DeleteIcon className="w-4 h-4 mr-2" />
        Apagar
      </Button>
    </div>
  );
};

export default VoucherNumpad;