import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from '../utils/api';

const UserConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');
  const { userName, userTurno, mealType } = location.state || {};

  useEffect(() => {
    // Fetch background image from API
    const fetchBackgroundImage = async () => {
      try {
        const response = await api.get('/background-images');
        const images = response.data;
        const userConfirmationBackground = images.find(img => img.page === 'userConfirmation')?.image_url;
        if (userConfirmationBackground) {
          setBackgroundImage(userConfirmationBackground);
          localStorage.setItem('userConfirmationBackground', userConfirmationBackground);
        }
      } catch (error) {
        console.error('Error fetching background image:', error);
      }
    };

    fetchBackgroundImage();
  }, []);

  const handleConfirm = () => {
    navigate(`/bom-apetite/${userName}`, { state: { mealType } });
  };

  const handleCancel = () => {
    navigate('/voucher');
  };

  if (!userName) {
    toast.error("Informações do usuário não encontradas");
    navigate('/voucher');
    return null;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-blue-600 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Confirmar Usuário</h2>
        <div className="space-y-4">
          <p className="text-lg">Nome: <span className="font-semibold">{userName}</span></p>
          <p className="text-lg">Turno: <span className="font-semibold">{userTurno}</span></p>
          <p className="text-lg">Refeição: <span className="font-semibold">{mealType}</span></p>
        </div>
        <div className="mt-8 space-x-4 flex justify-center">
          <Button onClick={handleCancel} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserConfirmation;