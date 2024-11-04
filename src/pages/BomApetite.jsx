import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import api from '../utils/api';

const BomApetite = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const mealType = location.state?.mealType || 'Refeição';
  const [backgroundImage, setBackgroundImage] = useState('');

  // Função auxiliar para validar URLs de imagem
  const isValidImageUrl = (url) => {
    if (url.startsWith('data:image/')) {
      const [header, content] = url.split(',');
      if (!header.includes('image/') || !content) {
        return false;
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Função para buscar e validar a imagem de fundo
    const fetchBackgroundImage = async () => {
      try {
        const response = await api.get('/background-images');
        const images = response.data;
        
        // Busca especificamente a imagem para a página de bom apetite
        const bomApetiteBackground = images.find(img => img.page === 'bomApetite')?.image_url;
        
        // Verifica se a URL da imagem é válida e segura
        if (bomApetiteBackground && isValidImageUrl(bomApetiteBackground)) {
          setBackgroundImage(bomApetiteBackground);
          localStorage.setItem('bomApetiteBackground', bomApetiteBackground);
        } else {
          console.warn('Invalid or unsafe background image URL detected');
        }
      } catch (error) {
        console.error('Error fetching background image:', error);
        // Usa imagem em cache do localStorage como fallback
        const cachedImage = localStorage.getItem('bomApetiteBackground');
        if (cachedImage) setBackgroundImage(cachedImage);
      }
    };

    fetchBackgroundImage();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      toast.success("Redirecionando para a página de voucher...");
      navigate('/voucher');
    }
  }, [countdown, navigate]);

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-blue-600 p-4 bg-cover bg-center bg-no-repeat"
      style={{
        // Aplica a imagem de fundo apenas se for válida
        backgroundImage: backgroundImage && isValidImageUrl(backgroundImage) 
          ? `url(${backgroundImage})` 
          : undefined,
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