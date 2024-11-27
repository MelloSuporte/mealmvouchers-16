import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';
import VoucherForm from '../components/voucher/VoucherForm';
import { supabase } from '../config/supabase';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'voucher')
          .eq('is_active', true)
          .single();

        if (error) throw error;
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    fetchBackgroundImage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const checkResponse = await supabase
        .from('vouchers_descartaveis')
        .select('*')
        .eq('codigo', voucherCode)
        .single();

      if (checkResponse.data) {
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: checkResponse.data.tipo_refeicao_id
        }));

        navigate('/self-services');
        return;
      }

      const response = await supabase
        .from('usuarios')
        .select('*')
        .eq('voucher', voucherCode)
        .single();

      if (response.data) {
        navigate('/user-confirmation', { 
          state: { 
            userName: response.data.nome,
            userTurno: response.data.turno_id,
            mealType: localStorage.getItem('selectedMealType')
          }
        });
      } else {
        toast.error("Voucher inválido");
      }
    } catch (error) {
      toast.error("Erro ao validar o voucher. Tente novamente.");
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
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
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