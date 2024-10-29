import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UserConfirmation = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const { userPhoto, userName } = location.state || {};
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const savedBackground = localStorage.getItem('userConfirmationBackground');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      handleCancel();
    }
  }, [countdown]);

  const handleConfirm = () => {
    toast.success("Usuário confirmado!");
    navigate('/self-services');
  };

  const handleCancel = () => {
    toast.error("Confirmação cancelada. Retornando à página de voucher.");
    navigate('/voucher');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-blue-600 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Confirme sua identidade</h2>
        {userPhoto && (
          <img src={userPhoto} alt={userName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
        )}
        <p className="mb-4">Olá, {userName}! É você mesmo?</p>
        <p className="mb-4">Retorno automático à página de voucher em: {countdown} segundos</p>
        <div className="flex justify-between">
          <Button onClick={handleCancel} variant="outline">Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;