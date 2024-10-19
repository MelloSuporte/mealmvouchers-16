import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UserConfirmation = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const { userPhoto, userName } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      handleConfirm();
    }
  }, [countdown]);

  const handleConfirm = () => {
    toast.success("Usuário confirmado!");
    navigate('/self-services');
  };

  const handleCancel = () => {
    toast.error("Confirmação cancelada.");
    navigate('/voucher');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Confirme sua identidade</h2>
        {userPhoto && (
          <img src={userPhoto} alt={userName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
        )}
        <p className="mb-4">Olá, {userName}! É você mesmo?</p>
        <p className="mb-4">Confirmação automática em: {countdown} segundos</p>
        <div className="flex justify-between">
          <Button onClick={handleCancel} variant="outline">Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;