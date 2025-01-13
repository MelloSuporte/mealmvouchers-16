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
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    const storedData = localStorage.getItem('commonVoucher');
    const currentMealType = localStorage.getItem('currentMealType');
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Ensure turno data is properly structured
      if (parsedData.turno && typeof parsedData.turno === 'object') {
        setUserData(parsedData);
        logger.info('Dados do usuário carregados:', parsedData);
      } else {
        logger.error('Dados do turno inválidos:', parsedData);
        toast.error('Erro ao carregar dados do turno');
        navigate('/voucher');
      }
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

      // Validate turno data
      if (!userData?.turno?.id) {
        logger.error('Turno não encontrado:', userData);
        toast.error('Turno do usuário não encontrado');
        return;
      }

      const mealTypeData = JSON.parse(currentMealType);

      logger.info('Validando horário para:', {
        turnoId: userData.turno.id,
        tipoRefeicaoId: mealTypeData.id
      });

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

  const getTurnoLabel = (turno) => {
    if (!turno) return 'Não definido';
    
    const labels = {
      'central': 'Administrativo',
      'primeiro': '1º Turno',
      'segundo': '2º Turno',
      'terceiro': '3º Turno'
    };
    
    return labels[turno.tipo_turno] || turno.tipo_turno;
  };

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
          turno={getTurnoLabel(userData.turno)}
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