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
          .eq('page', 'user-confirmation')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          logger.error('Erro ao buscar imagem de fundo:', error);
          return;
        }

        if (data?.image_url) {
          setBackgroundImage(data.image_url);
          logger.info('Imagem de fundo carregada com sucesso');
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    const loadStoredData = async () => {
      try {
        // Check for both voucher types
        const commonVoucherData = localStorage.getItem('commonVoucher');
        const disposableVoucherData = localStorage.getItem('disposableVoucher');
        
        if (!commonVoucherData && !disposableVoucherData) {
          logger.warn('Nenhum dado encontrado no localStorage');
          navigate('/voucher');
          return;
        }

        // Handle common voucher
        if (commonVoucherData) {
          const parsedData = JSON.parse(commonVoucherData);
          logger.info('Dados carregados do localStorage:', parsedData);

          // Buscar dados do turno do usuário
          const { data: turnoData, error: turnoError } = await supabase
            .from('usuarios')
            .select('turno_id, turnos:turnos(*)')
            .eq('id', parsedData.userId)
            .maybeSingle();

          if (turnoError) {
            logger.error('Erro ao buscar turno do usuário:', turnoError);
            toast.error('Erro ao carregar turno do usuário');
            navigate('/voucher');
            return;
          }

          if (!turnoData?.turnos) {
            logger.error('Turno não encontrado para o usuário:', parsedData.userId);
            toast.error('Turno não encontrado');
            navigate('/voucher');
            return;
          }

          setUserData({
            ...parsedData,
            turno: {
              id: turnoData.turno_id,
              tipo_turno: turnoData.turnos.tipo_turno
            }
          });
        }
        
        // Handle disposable voucher
        if (disposableVoucherData) {
          const parsedData = JSON.parse(disposableVoucherData);
          setUserData({
            ...parsedData,
            userName: 'Voucher Descartável',
            turno: { tipo_turno: 'N/A' }
          });
        }

        // Load meal type data
        const currentMealType = localStorage.getItem('currentMealType');
        if (currentMealType) {
          setMealType(JSON.parse(currentMealType));
          logger.info('Tipo de refeição carregado:', JSON.parse(currentMealType));
        }
      } catch (error) {
        logger.error('Erro ao processar dados:', error);
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
    localStorage.removeItem('disposableVoucher');
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
      'terceiro': '3º Turno',
      'N/A': 'N/A'
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