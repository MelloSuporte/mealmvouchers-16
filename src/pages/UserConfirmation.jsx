import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '../config/supabase';

const UserConfirmation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Get stored voucher data
      const voucherData = localStorage.getItem('commonVoucher');
      if (!voucherData) {
        toast.error('Dados do voucher não encontrados');
        navigate('/');
        return;
      }

      const { code, userName, turno, cpf } = JSON.parse(voucherData);

      // Validate voucher
      const { data, error } = await supabase
        .from('uso_voucher')
        .insert([
          {
            usuario_id: cpf,
            tipo_refeicao_id: turno,
            usado_em: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro na validação:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        throw new Error(error.message);
      }

      // Clear stored data
      localStorage.removeItem('commonVoucher');
      
      // Navigate to success page
      navigate('/bom-apetite', { 
        state: { userName, turno } 
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Confirmar Refeição
        </h2>
        
        <p className="text-center text-gray-600">
          Deseja confirmar sua refeição?
        </p>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;