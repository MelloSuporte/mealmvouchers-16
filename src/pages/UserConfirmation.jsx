import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const UserConfirmation = () => {
  const navigate = useNavigate();
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

  const getMealTypeByTurno = (turno) => {
    // Mapeamento de turnos para tipos de refeição
    const mealTypeMap = {
      'central': 'Almoço',
      'primeiro': 'Café (1)',
      'segundo': 'Jantar',
      'terceiro': 'Ceia'
    };
    return mealTypeMap[turno] || 'Almoço'; // Default para 'Almoço' se não encontrar
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Obter dados do voucher do localStorage
      const voucherData = localStorage.getItem('commonVoucher');
      if (!voucherData) {
        toast.error('Dados do voucher não encontrados');
        navigate('/');
        return;
      }

      const { code, userName, turno, cpf } = JSON.parse(voucherData);

      // Primeiro, buscar o ID do usuário usando o CPF
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('cpf', cpf)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw new Error('Usuário não encontrado');
      }

      // Mapear o turno para o tipo de refeição correto
      const mealTypeName = getMealTypeByTurno(turno);
      console.log('Buscando tipo de refeição:', mealTypeName);

      // Buscar o ID do tipo de refeição baseado no nome mapeado
      const { data: tipoRefeicaoData, error: tipoRefeicaoError } = await supabase
        .from('tipos_refeicao')
        .select('id')
        .eq('nome', mealTypeName)
        .single();

      if (tipoRefeicaoError) {
        console.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
        throw new Error('Tipo de refeição não encontrado');
      }

      // Agora validar o voucher usando o ID do usuário e o ID do tipo de refeição
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_and_use_common_voucher', {
          p_usuario_id: userData.id,
          p_tipo_refeicao_id: tipoRefeicaoData.id
        });

      if (validationError) {
        console.error('Erro na validação:', validationError);
        throw validationError;
      }

      if (!validationResult?.success) {
        throw new Error(validationResult?.error || 'Erro ao validar voucher');
      }

      // Limpar dados armazenados
      localStorage.removeItem('commonVoucher');
      
      // Navegar para página de sucesso
      navigate('/bom-apetite', { 
        state: { userName: userData.nome, turno } 
      });

    } catch (error) {
      console.error('Erro na validação:', error);
      toast.error(error.message || 'Erro ao validar voucher');
      navigate('/');
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
            {JSON.parse(localStorage.getItem('commonVoucher') || '{}').userName || 'Usuário'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Tipo de Refeição</h3>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {getMealTypeByTurno(JSON.parse(localStorage.getItem('commonVoucher') || '{}').turno) || 'Refeição'}
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