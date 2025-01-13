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
        logger.info('Iniciando busca da imagem de fundo...');
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'userConfirmation')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          logger.error('Erro ao buscar imagem de fundo:', error);
          return;
        }

        logger.info('Resultado da busca da imagem:', data);
        if (data) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', {
          message: error.message,
          details: error.stack,
          hint: error.hint || '',
          code: error.code || ''
        });
      }
    };

    const loadStoredData = () => {
      try {
        const storedData = localStorage.getItem('commonVoucher');
        const currentMealType = localStorage.getItem('currentMealType');
        
        if (!storedData) {
          navigate('/voucher');
          return;
        }

        const parsedData = JSON.parse(storedData);
        logger.info('Dados carregados do localStorage:', parsedData);

        // Validação específica para o turno
        if (!parsedData.turno) {
          logger.error('Dados do turno ausentes no objeto:', parsedData);
          toast.error('Dados do turno não encontrados');
          navigate('/voucher');
          return;
        }

        // Validação da estrutura do turno
        if (!parsedData.turno.id || !parsedData.turno.tipo_turno) {
          logger.error('Estrutura do turno inválida:', parsedData.turno);
          toast.error('Estrutura do turno inválida');
          navigate('/voucher');
          return;
        }

        setUserData(parsedData);

        if (currentMealType) {
          try {
            const parsedMealType = JSON.parse(currentMealType);
            setMealType(parsedMealType);
            logger.info('Tipo de refeição carregado:', parsedMealType);
          } catch (error) {
            logger.error('Erro ao processar tipo de refeição:', error);
            toast.error('Erro ao carregar tipo de refeição');
          }
        }
      } catch (error) {
        logger.error('Erro ao processar dados armazenados:', error);
        toast.error('Erro ao carregar dados do usuário');
        navigate('/voucher');
      }
    };

    fetchBackgroundImage();
    loadStoredData();
  }, [navigate]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const currentMealType = localStorage.getItem('currentMealType');
      
      if (!currentMealType) {
        toast.error('Tipo de refeição não encontrado');
        return;
      }

      // Validação do turno antes de prosseguir
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
    if (!turno || !turno.tipo_turno) {
      logger.warn('Dados do turno inválidos:', turno);
      return 'Não definido';
    }
    
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