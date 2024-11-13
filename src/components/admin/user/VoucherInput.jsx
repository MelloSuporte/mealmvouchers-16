import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

const VoucherInput = ({ voucher, showVoucher, onToggleVoucher, disabled }) => {
  useEffect(() => {
    let timer;
    if (showVoucher) {
      timer = setTimeout(() => {
        onToggleVoucher(false);
      }, 60000); // Aumentado para 60 segundos
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showVoucher, onToggleVoucher]);

  const displayValue = showVoucher ? voucher || '' : voucher ? '****' : '';

  return (
    <div className="flex items-center space-x-2">
      <Input 
        placeholder="Voucher (gerado automaticamente)" 
        value={displayValue}
        readOnly
        className="bg-gray-100"
        disabled={disabled}
      />
      <Button 
        type="button" 
        variant="outline"
        onClick={() => onToggleVoucher(!showVoucher)}
        disabled={disabled || !voucher}
      >
        {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
      </Button>
    </div>
  );
};

export default VoucherInput;