import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

const VoucherInput = ({ voucher, showVoucher, onToggleVoucher, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <Input 
        placeholder="Voucher (gerado automaticamente)" 
        value={voucher || ''}
        readOnly
        className="bg-gray-100"
        disabled={disabled}
      />
      <Button 
        type="button" 
        variant="outline"
        onClick={onToggleVoucher}
        disabled={disabled}
      >
        {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
      </Button>
    </div>
  );
};

export default VoucherInput;