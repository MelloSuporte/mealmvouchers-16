import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const savedBackground = localStorage.getItem('voucherBackground');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const usedVouchers = JSON.parse(localStorage.getItem('usedVouchers') || '{}');

    // Simular a verificação do voucher (isso deve ser substituído por uma chamada à API real)
    const mockUserData = {
      userName: "João Silva",
      userPhoto: "https://example.com/path/to/photo.jpg"
    };

    try {
      // Verificar se o voucher é extra através da API
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voucherCode }),
      });

      const data = await response.json();

      if (data.isExtraVoucher) {
        // Se for um voucher extra, verificar as regras RLS
        checkRLSRules(today, mockUserData);
      } else {
        // Se for um voucher regular, verificar limite individual
        checkRegularVoucherLimit(today, usedVouchers, mockUserData);
      }
    } catch (error) {
      toast.error("Erro ao validar o voucher. Tente novamente.");
    }
  };

  const checkRLSRules = (today, userData) => {
    // Aqui você deve implementar a lógica para verificar as regras RLS
    // Por enquanto, vamos apenas simular a aprovação
    const isApproved = true; // Substitua isso pela lógica real de verificação RLS

    if (isApproved) {
      navigate('/user-confirmation', { state: { ...userData, voucherType: 'Extra' } });
    } else {
      toast.error("Voucher Extra não autorizado pelas regras RLS.");
    }
  };

  const checkRegularVoucherLimit = (today, usedVouchers, userData) => {
    if (!usedVouchers[today]) {
      usedVouchers[today] = [];
    }

    // Verificar se todos os tipos de refeição regular já foram usados
    const regularMealTypes = ['Almoço', 'Café', 'Lanche', 'Jantar', 'Ceia'];
    const unusedMealTypes = regularMealTypes.filter(type => !usedVouchers[today].includes(type));

    if (unusedMealTypes.length > 0) {
      navigate('/user-confirmation', { state: { ...userData, voucherType: 'Regular' } });
    } else {
      toast.error("Limite diário de vouchers regulares atingido.");
    }
  };

  const handleNumpadClick = (num) => {
    setVoucherCode(prevCode => {
      if (prevCode.length < 4) {
        return prevCode + num;
      }
      return prevCode;
    });
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
            disabled={voucherCode.length >= 4}
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
    <div 
      className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Button
        onClick={() => setIsAdminLoginOpen(true)}
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
                onChange={(e) => setVoucherCode(e.target.value.slice(0, 4))}
                maxLength={4}
                readOnly
              />
            </div>
          </div>
          {renderNumpad()}
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={voucherCode.length !== 4}
            >
              Enter
            </Button>
          </div>
        </form>
      </div>
      <AdminLoginDialog 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
    </div>
  );
};

export default Voucher;