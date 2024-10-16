import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Ticket, Settings } from 'lucide-react';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Voucher submitted:', voucherCode);
    navigate('/self-services');
  };

  const handleNumpadClick = (num) => {
    setVoucherCode(prevCode => prevCode + num);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackspace = () => {
    setVoucherCode(prevCode => prevCode.slice(0, -1));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderNumpad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {numbers.map(num => (
          <Button
            key={num}
            type="button"
            onClick={() => handleNumpadClick(num)}
            className="bg-gray-200 text-black hover:bg-gray-300 text-xl py-4"
          >
            {num}
          </Button>
        ))}
        <Button 
          type="button"
          onClick={handleBackspace} 
          className="bg-red-500 hover:bg-red-600 text-white col-span-2"
        >
          Backspace
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4 relative">
      <Button
        onClick={() => navigate('/admin')}
        className="absolute top-4 right-4 bg-white text-blue-600 hover:bg-blue-100"
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin
      </Button>
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600">Voucher</h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Código do Voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                readOnly
              />
              <Ticket className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          {renderNumpad()}
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Voucher;