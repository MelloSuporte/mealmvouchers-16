import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '../config/supabase';

const BomApetite = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const mealType = location.state?.mealType || 'Refeição';
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'bomApetite')
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          toast.success("Redirecionando para a página de voucher...");
          navigate('/voucher');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-blue-600 p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Bom Apetite!</h1>
        <p className="text-xl mb-4">Olá, {userName}!</p>
        <p className="text-lg mb-6">Aproveite seu(sua) {mealType}.</p>
        <p className="text-md">Retornando à página de voucher em {countdown} segundos...</p>
      </div>
    </div>
  );
};

export default BomApetite;