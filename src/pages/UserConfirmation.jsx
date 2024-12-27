import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { validateVoucher, registerVoucherUsage } from '../components/voucher/VoucherValidation';
import ConfirmationHeader from '../components/confirmation/ConfirmationHeader';
import UserDataDisplay from '../components/confirmation/UserDataDisplay';
import ConfirmationActions from '../components/confirmation/ConfirmationActions';

const UserConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'userConfirmation')
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

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const { mealType, mealName, voucherCode, cpf } = location.state;
      
      await validateVoucher({
        voucherCode,
        mealType,
        mealName,
        cpf,
        turnoId: location.state.userTurno
      });

      await registerVoucherUsage({
        userId: location.state.userId,
        mealType,
        mealName
      });

      localStorage.removeItem('commonVoucher');
      
      navigate('/bom-apetite', { 
        state: { 
          userName: location.state.userName,
          turno: location.state.userTurno
        } 
      });

    } catch (error) {
      logger.error('Erro na validação:', error);
      toast.error(error.message || 'Erro ao validar voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('commonVoucher');
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundColor: 'rgb(185, 28, 28)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <ConfirmationHeader />
        
        <UserDataDisplay 
          userName={location.state?.userName}
          mealName={location.state?.mealName}
        />

        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-blue-600">ℹ</span>
          <p className="text-sm">
            Ao confirmar, seu voucher será validado e você será redirecionado para a próxima etapa.
          </p>
        </div>

        <ConfirmationActions 
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UserConfirmation;