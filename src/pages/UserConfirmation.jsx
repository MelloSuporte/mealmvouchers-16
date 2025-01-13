import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { toast } from "sonner";
import UserDataDisplay from '../components/confirmation/UserDataDisplay';
import ConfirmationActions from '../components/confirmation/ConfirmationActions';

const UserConfirmation = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mealType, setMealType] = useState(null);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'userConfirmation')
          .eq('is_active', true);

        if (error) throw error;
        
        // Check if we have any results before accessing the first one
        if (data && data.length > 0) {
          setBackgroundImage(data[0].image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
        // Continue without background image if there's an error
      }
    };

    const storedData = localStorage.getItem('commonVoucher');
    const currentMealType = localStorage.getItem('currentMealType');
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      logger.info('Dados do usuário carregados:', parsedData);
    } else {
      navigate('/voucher');
    }

    if (currentMealType) {
      setMealType(JSON.parse(currentMealType));
      logger.info('Tipo de refeição carregado:', currentMealType);
    }

    fetchBackgroundImage();
  }, [navigate]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const currentMealType = localStorage.getItem('currentMealType');
      
      if (!currentMealType) {
        toast.error('Tipo de refeição não encontrado');
        return;
      }

      if (!userData?.turno?.id) {
        toast.error('Turno do usuário não encontrado');
        logger.error('Turno não encontrado:', userData);
        return;
      }

      const mealTypeData = JSON.parse(currentMealType);

      logger.info('Validando horário para:', {
        turnoId: userData.turno.id,
        tipoRefeicaoId: mealTypeData.id
      });

      // Validate meal time considering user's shift
      const { data: validationResult, error: validationError } = await supabase
        .rpc('check_meal_time_and_shift', {
          p_tipo_refeicao_id: mealTypeData.id,
          p_turno_id: userData.turno.id
        });

      if (validationError) {
        logger.error('Erro na validação do horário:', validationError);
        toast.error('Erro na validação do horário');
        return;
      }

      if (!validationResult) {
        toast.error('Horário não permitido para este turno');
        return;
      }

      navigate('/bom-apetite');
    } catch (error) {
      logger.error('Erro na confirmação:', error);
      toast.error(error.message || 'Erro ao confirmar usuário');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('commonVoucher');
    localStorage.removeItem('currentMealType');
    navigate('/voucher');
  };

  if (!userData) return null;

  return (
    <div 
      className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Confirmar Usuário
        </h2>
        
        <UserDataDisplay 
          userName={userData.userName}
          cpf={userData.cpf}
          turno={userData.turno?.tipo_turno || 'Não definido'}
          mealName={mealType?.nome || 'Não definido'}
        />
        
        <ConfirmationActions
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isConfirming}
        />
      </div>
    </div>
  );
};

export default UserConfirmation;