import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';

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
      
      logger.info('Dados para validação:', {
        mealType,
        mealName,
        voucherCode,
        cpf,
        turnoId: location.state.userTurno
      });

      const { data: result, error } = await supabase.rpc('validate_and_use_voucher', {
        p_codigo: voucherCode,
        p_tipo_refeicao_id: mealType
      });

      if (error) {
        logger.error('Erro na validação:', error);
        throw new Error(error.message || 'Erro ao validar voucher');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao validar voucher');
      }

      // Register voucher usage with correct column name usado_em
      const { error: usageError } = await supabase
        .from('uso_voucher')
        .insert({
          usuario_id: location.state.userId,
          tipo_refeicao_id: mealType,
          usado_em: new Date().toISOString(),
          observacao: `Voucher ${voucherCode} utilizado para ${mealName}`
        });

      if (usageError) {
        throw new Error(usageError.message || 'Erro ao registrar uso do voucher');
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
        <h2 className="text-2xl font-bold text-center">
          Confirmar Refeição
        </h2>
        
        <p className="text-center text-gray-600">
          Por favor, confirme os dados abaixo
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Dados do Usuário</h3>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {location.state?.userName || 'Usuário'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Tipo de Refeição</h3>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {location.state?.mealName || 'Refeição'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-blue-600">ℹ</span>
          <p className="text-sm">
            Ao confirmar, seu voucher será validado e você será redirecionado para a próxima etapa.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;