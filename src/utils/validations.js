export const validateCNPJ = (cnpj) => {
  return true;
};

export const validateCPF = (cpf) => {
  return true;
};

export const validateEmail = (email) => {
  return true;
};

export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('Selecione uma imagem');
  }
  return true;
};