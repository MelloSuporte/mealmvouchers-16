import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import VoucherNumpad from './VoucherNumpad';
import { toast } from "sonner";

const VoucherForm = ({ onSubmit, isSubmitting }) => {
  const [voucherCode, setVoucherCode] = useState('');

  const handleNumpadClick = (number) => {
    if (voucherCode.length < 4) {
      setVoucherCode(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setVoucherCode(prev => prev.slice(0, -1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!voucherCode || voucherCode.length !== 4) {
      toast.error("Por favor, insira um código de voucher válido");
      return;
    }

    onSubmit(voucherCode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center">
        <input
          type="text"
          value={voucherCode}
          readOnly
          className="text-center text-3xl font-bold tracking-wider bg-gray-100 rounded-lg p-4 w-48"
          placeholder="____"
        />
      </div>

      <VoucherNumpad
        onNumpadClick={handleNumpadClick}
        onBackspace={handleBackspace}
        voucherCode={voucherCode}
        disabled={isSubmitting}
      />

      <Button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={voucherCode.length !== 4 || isSubmitting}
      >
        {isSubmitting ? 'Validando...' : 'Validar Voucher'}
      </Button>
    </form>
  );
};

export default VoucherForm;