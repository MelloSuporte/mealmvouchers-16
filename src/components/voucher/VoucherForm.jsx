import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import VoucherNumpad from './VoucherNumpad';

const VoucherForm = ({ voucherCode, onSubmit, onNumpadClick, onBackspace, isValidating }) => {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div className="relative">
          <Input
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Código do Voucher"
            value={voucherCode}
            maxLength={4}
            readOnly
          />
        </div>
      </div>
      <VoucherNumpad 
        onNumpadClick={onNumpadClick}
        onBackspace={onBackspace}
        voucherCode={voucherCode}
        disabled={isValidating}
      />
      <div>
        <Button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={voucherCode.length !== 4 || isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando...
            </>
          ) : (
            'Enter'
          )}
        </Button>
      </div>
    </form>
  );
};

export default VoucherForm;