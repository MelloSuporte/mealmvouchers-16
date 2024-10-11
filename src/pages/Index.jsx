import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
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
    // Simulating a user name for demonstration purposes
    const userName = "User";
    navigate(`/bom-apetite/${userName}`);
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-100">
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%]"></div>
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                required
                className="w-full pl-10 pr-4 py-4 text-2xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VOUCHER"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                readOnly
              />
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
            {renderNumpad()}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 text-xl rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              ENTER
            </Button>
          </form>
          <div className="text-center">
            <Button
              onClick={() => navigate('/admin-login')}
              variant="link"
              className="text-blue-600 hover:text-blue-800 font-medium transition duration-300 ease-in-out text-lg"
            >
              ADMIN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;