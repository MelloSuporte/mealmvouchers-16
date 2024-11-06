export const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length !== 14) {
    throw new Error('CNPJ deve ter 14 números');
  }
  return true;
};

export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) {
    throw new Error('CPF deve ter 11 números');
  }
  return true;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
  return true;
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Use imagens JPEG, PNG ou GIF');
  }

  if (file.size > maxSize) {
    throw new Error('Imagem muito grande. Máximo: 5MB');
  }

  return true;
};