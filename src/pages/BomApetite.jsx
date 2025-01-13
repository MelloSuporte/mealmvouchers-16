import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { toast } from 'sonner';

const BomApetite = () => {
  const [backgroundImage, setBackgroundImage] = React.useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'bomApetite')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        logger.error('Erro ao buscar imagem de fundo:', error);
        toast.error('Erro ao carregar imagem de fundo');
      }
    };

    fetchBackgroundImage();

    // Clear localStorage data
    const clearDataAndRedirect = () => {
      localStorage.removeItem('commonVoucher');
      localStorage.removeItem('disposableVoucher');
      localStorage.removeItem('currentMealType');
      navigate('/voucher');
    };

    // Set timeout to redirect after 3 seconds
    const redirectTimer = setTimeout(clearDataAndRedirect, 3000);

    // Cleanup timer on component unmount
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <h2 className="text-3xl font-bold text-white mb-4">Bom Apetite!</h2>
      <p className="text-white text-lg">Redirecionando em alguns segundos...</p>
    </div>
  );
};

export default BomApetite;