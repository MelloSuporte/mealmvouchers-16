import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { getBackgroundImageStyle } from '../utils/backgroundImage';

const UserConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, voucherType } = location.state || {};
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await fetch('/api/background-image?page=confirmar');
        if (response.ok) {
          const data = await response.json();
          setBackgroundImage(data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch background image:', error);
      }
    };

    fetchBackgroundImage();
  }, []);

  const handleConfirm = () => {
    navigate('/self-services', { state: { voucherType } });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={getBackgroundImageStyle(backgroundImage)}
    >
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Confirmar Usuário</h2>
        <p className="mb-4">Olá, {userName}!</p>
        <p className="mb-4">Você está usando um voucher do tipo: {voucherType}</p>
        <Button onClick={handleConfirm}>Confirmar e Continuar</Button>
      </div>
    </div>
  );
};

export default UserConfirmation;