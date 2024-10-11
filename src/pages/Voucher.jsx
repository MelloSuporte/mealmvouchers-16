import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para validar o código do voucher
    console.log('Voucher submitted:', voucherCode);
    // Após a validação bem-sucedida, redirecione para a página SelfServices
    navigate('/self-services');
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600">Voucher</h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Código do Voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                icon={<Ticket className="h-5 w-5 text-gray-400" />}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enter
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/admin-login" className="font-medium text-blue-600 hover:text-blue-500">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Voucher;