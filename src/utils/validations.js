export const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    throw new Error('CNPJ deve conter 14 dígitos');
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    throw new Error('CNPJ inválido');
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let pos = 5;

  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cleanCNPJ[12])) {
    throw new Error('CNPJ inválido');
  }

  // Segundo dígito verificador
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cleanCNPJ[13])) {
    throw new Error('CNPJ inválido');
  }

  return true;
};

export const validateVoucherCode = (code) => {
  if (!code) throw new Error('Código do voucher é obrigatório');
  if (code.length !== 4) throw new Error('Código do voucher deve ter 4 dígitos');
  if (!/^\d+$/.test(code)) throw new Error('Código do voucher deve conter apenas números');
  return true;
};

export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) {
    throw new Error('CPF deve conter 11 dígitos');
  }

  if (/^(\d)\1+$/.test(cleanCPF)) {
    throw new Error('CPF inválido');
  }

  // Validação do primeiro dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cleanCPF[9])) {
    throw new Error('CPF inválido');
  }

  // Validação do segundo dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cleanCPF[10])) {
    throw new Error('CPF inválido');
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
    throw new Error('Formato de imagem inválido. Use JPEG, PNG ou GIF');
  }

  if (file.size > maxSize) {
    throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
  }

  return true;
};