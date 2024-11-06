export const validateImage = (file) => {
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (!file || !(file instanceof File)) {
    throw new Error("Arquivo inválido");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato de arquivo não permitido. Use: JPG, PNG, GIF ou WEBP");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Arquivo muito grande. Limite máximo: 5MB");
  }

  return true;
};

export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};