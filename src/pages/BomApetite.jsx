import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '../config/supabase';

const BomApetite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [backgroundImage, setBackgroundImage] = useState('');
  
  // Extrair dados do state com valores padrão
  const userName = location.state?.userName || 'Visitante';
  const turno = location.state?.turno || '';

  useEffect(() => {
    // Verificar se tem dados necessários
    if (!location.state) {
      console.log('Redirecionando para /voucher - Dados ausentes');
      toast.error("Dados inválidos. Redirecionando...");
      navigate('/voucher');
      return;
    }

    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'bomApetite')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Erro ao buscar imagem de fundo:', error);
          return;
        }
        
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    fetchBackgroundImage();

    // Limpar vouchers do localStorage
    localStorage.removeItem('disposableVoucher');
    localStorage.removeItem('commonVoucher');
    localStorage.removeItem('extraVoucher');

    // Iniciar countdown
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          console.log('Redirecionando para /voucher após countdown');
          navigate('/voucher');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // Garantir limpeza do localStorage
      localStorage.removeItem('disposableVoucher');
      localStorage.removeItem('commonVoucher');
      localStorage.removeItem('extraVoucher');
    };
  }, [navigate, location.state]);

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom, #9b87f5, #7E69AB)',
        backgroundColor: '#9b87f5'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-[#6E59A5] mb-4">Bom Apetite!</h1>
        <p className="text-xl mb-4">Olá, {userName}!</p>
        <p className="text-lg mb-6">
          Aproveite sua refeição!
        </p>
        <p className="text-md text-gray-600">
          Retornando à página de voucher em {countdown} segundos...
        </p>
      </div>
    </div>
  );
};

export default BomApetite;