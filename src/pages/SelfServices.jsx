import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';

const SelfServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleConfirm = () => {
    // Navega diretamente para bom-apetite com os dados necessários
    navigate('/bom-apetite', {
      state: {
        userName: location.state?.userName,
        userTurno: location.state?.userTurno
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Self Service
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Confirme sua escolha para prosseguir
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleConfirm}
            className="w-full"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfServices;