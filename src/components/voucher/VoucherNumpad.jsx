import React from 'react';
import { Button } from "@/components/ui/button";

const VoucherNumpad = ({ onNumpadClick, onBackspace, voucherCode }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {numbers.map(num => (
        <Button
          key={num}
          type="button"
          onClick={() => onNumpadClick(num)}
          className="bg-gray-200 text-black hover:bg-gray-300 text-xl py-4"
          disabled={voucherCode.length >= 4}
        >
          {num}
        </Button>
      ))}
      <Button 
        type="button"
        onClick={onBackspace} 
        className="bg-red-500 hover:bg-red-600 text-white col-span-2"
      >
        Backspace
      </Button>
    </div>
  );
};

export default VoucherNumpad;