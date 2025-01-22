import React from 'react';
import { Button } from "@/components/ui/button";
import { Backspace } from "lucide-react";

const VoucherNumpad = ({ onNumpadClick, onBackspace, voucherCode = '', disabled }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="grid grid-cols-3 gap-2">
      {numbers.map((number) => (
        <Button
          key={number}
          type="button"
          variant="outline"
          onClick={() => onNumpadClick(number)}
          disabled={disabled || voucherCode.length >= 4}
          className="h-12 text-lg font-semibold"
        >
          {number}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={onBackspace}
        disabled={disabled || !voucherCode.length}
        className="h-12"
      >
        <Backspace className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VoucherNumpad;