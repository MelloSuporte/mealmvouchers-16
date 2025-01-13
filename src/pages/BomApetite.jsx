import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const BomApetite = () => {
  const [backgroundImage, setBackgroundImage] = useState('');

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
      }
    };

    fetchBackgroundImage();
  }, []);

  return (
    <div 
      className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <h2 className="text-3xl font-bold text-white">Bom Apetite!</h2>
    </div>
  );
};

export default BomApetite;
