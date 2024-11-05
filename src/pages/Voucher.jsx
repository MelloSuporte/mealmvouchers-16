import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';
import api from '../utils/api';

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
    
    // Função para buscar e validar a imagem de fundo da página de voucher
    const fetchBackgroundImage = async () => {
      try {
        const response = await api.get('/background-images');
        const images = response.data;
        
        // Busca especificamente a imagem para a página de voucher
        const voucherBackground = images.find(img => img.page === 'voucher')?.image_url;
        
        // Verifica se a URL da imagem é válida e segura
        if (voucherBackground && isValidImageUrl(voucherBackground)) {
          setBackgroundImage(voucherBackground);
          localStorage.setItem('voucherBackground', voucherBackground);
        } else {
          console.warn('Invalid or unsafe background image URL detected');
        }
      } catch (error) {
        console.error('Error fetching background image:', error);
        // Usa imagem em cache do localStorage como fallback
        const cachedImage = localStorage.getItem('voucherBackground');
        if (cachedImage) setBackgroundImage(cachedImage);
      }
    };

    fetchBackgroundImage();
  }, []);

  // Função auxiliar para validar URLs de imagem
  const isValidImageUrl = (url) => {
    // Verifica se a URL é uma string base64 válida de imagem
    if (url.startsWith('data:image/')) {
      const [header, content] = url.split(',');
      if (!header.includes('image/') || !content) {
        return false;
      }
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First check if it's a disposable voucher
      const checkResponse = await api.post('/vouchers/check', { 
        code: voucherCode
      });

      if (checkResponse.data.exists) {
        const voucher = checkResponse.data.voucher;
        
        // Store voucher info for validation in SelfServices
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: voucher.meal_type_id
        }));

        // Navigate to self-services page
        navigate('/self-services');
        return;
      }

      // If not a disposable voucher, proceed with regular voucher validation
      const response = await api.post('/vouchers/validate', { 
        voucherCode,
        cpf: localStorage.getItem('userCPF') || '',
        mealType: localStorage.getItem('selectedMealType')
      });

      if (response.data.success) {
        navigate('/user-confirmation', { 
          state: { 
            userName: response.data.userName,
            userTurno: response.data.turno,
            mealType: localStorage.getItem('selectedMealType')
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao validar o voucher. Tente novamente.");
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
        backgroundImage: backgroundImage && `url(${backgroundImage})`
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
