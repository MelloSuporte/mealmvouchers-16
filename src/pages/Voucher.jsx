import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';
import VoucherForm from '../components/voucher/VoucherForm';
import api from '../utils/api';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await api.get('/background-images');
        const images = response.data;
        const voucherBackground = images.find(img => img.page === 'voucher')?.image_url;
        
        if (voucherBackground && isValidImageUrl(voucherBackground)) {
          setBackgroundImage(voucherBackground);
          localStorage.setItem('voucherBackground', voucherBackground);
        }
      } catch (error) {
        console.error('Error fetching background image:', error);
        const cachedImage = localStorage.getItem('voucherBackground');
        if (cachedImage) setBackgroundImage(cachedImage);
      }
    };

    fetchBackgroundImage();
  }, []);

  const isValidImageUrl = (url) => {
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
      const checkResponse = await api.post('/vouchers/check', { 
        code: voucherCode
      });

      if (checkResponse.data.exists) {
        const voucher = checkResponse.data.voucher;
        
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: voucher.meal_type_id
        }));

        navigate('/self-services');
        return;
      }

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
  };

  const handleBackspace = () => {
    setVoucherCode(prevCode => prevCode.slice(0, -1));
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
        <VoucherForm
          voucherCode={voucherCode}
          onSubmit={handleSubmit}
          onNumpadClick={handleNumpadClick}
          onBackspace={handleBackspace}
        />
      </div>
      <AdminLoginDialog 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
    </div>
  );
};

export default Voucher;