import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import logger from '../config/logger';
import { supabase } from '../config/supabase';
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
          .maybeSingle(); // Using maybeSingle() instead of single()

        if (error) {
          logger.error('Erro ao buscar imagem de fundo:', error);
          return;
        }

        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    fetchBackgroundImage();

    if (!location.state) {
      toast.error('Dados da refeição não encontrados');
      navigate('/');
      return;
    }

    const { mealType, mealName, voucherCode } = location.state;
    
    if (!mealType || !mealName || !voucherCode) {
      toast.error('Dados incompletos para confirmação');
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleConfirm = async () => {
    if (isLoading || !location.state) return;
    
    setIsLoading(true);
    try {
      const { mealType, voucherCode } = location.state;
      
      if (!mealType || !voucherCode) {
        throw new Error('Dados incompletos para validação');
      }
      
      logger.info('Iniciando confirmação com dados:', {
        mealType,
        mealName: location.state.mealName,
        voucherCode
      });

      // Validate and use voucher using RPC function
      const { data, error } = await supabase.rpc('validate_and_use_voucher', {
        p_codigo: voucherCode,
        p_tipo_refeicao_id: mealType
      });

      if (error) {
        logger.error('Erro na validação:', error);
        
        if (error.message?.includes('Fora do horário') || 
            error.message?.includes('horário não permitido')) {
          throw new Error('Fora do Horário de Turno');
        }
        
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao validar voucher');
      }

      localStorage.removeItem('commonVoucher');
      
      navigate('/bom-apetite', { 
        state: { 
          userName: location.state.userName,
          turno: location.state.userTurno
        } 
      });

    } catch (error) {
      logger.error('Erro na validação:', error);
      
      if (error.message?.includes('Fora do horário') || 
          error.message === 'Fora do Horário de Turno') {
        toast.error('Fora do Horário de Turno');
      } else {
        toast.error(error.message || 'Erro ao validar voucher');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('commonVoucher');
    navigate('/');
  };

  if (!location.state) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom, #ff6b6b, #ee5253)',
        backgroundColor: '#ff6b6b'
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