import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { toast } from "sonner";

const UserConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [userData, setUserData] = useState(null);

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
        
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    const storedData = localStorage.getItem('commonVoucher');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      navigate('/voucher');
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

      const mealTypeData = JSON.parse(currentMealType);
      
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_meal_time', {
          p_tipo_refeicao_id: mealTypeData.id
        });

      if (validationError) {
        throw validationError;
      }

      if (!validationResult?.success) {
        toast.error(validationResult?.message || 'Erro na validação do horário');
        return;
      }

      // Navigate to bom-apetite after successful confirmation
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
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold">{userData.userName}</p>
            <p className="text-gray-600">CPF: {userData.cpf}</p>
            <p className="text-gray-600">Turno: {userData.turno || 'Não definido'}</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={handleCancel}
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={isConfirming}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={isConfirming}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;