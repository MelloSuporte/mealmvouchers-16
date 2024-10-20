export const getBackgroundImageStyle = (imagePath) => {
  if (!imagePath) return {};

  return {
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };
};