import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Voucher submitted:', voucherCode);
    navigate('/self-services');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Blue curved shape */}
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%]"></div>
      
      {/* White curved shape */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gray-100 rounded-tr-[30%]"></div>
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VOUCHER"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              ENTER
            </Button>
          </form>
          <div className="text-center">
            <Button
              onClick={() => navigate('/admin-login')}
              variant="link"
              className="text-blue-600 hover:text-blue-800 font-medium transition duration-300 ease-in-out"
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