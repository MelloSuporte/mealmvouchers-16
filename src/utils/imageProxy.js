import axios from 'axios';

export const getProxiedImageUrl = (originalUrl) => {
  // Use uma URL local ou um serviço de proxy de imagens confiável
  return `/api/images/proxy?url=${encodeURIComponent(originalUrl)}`;
};

export const loadImage = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error loading image:', error);
    return '/placeholder.svg'; // Fallback para imagem local
  }
};