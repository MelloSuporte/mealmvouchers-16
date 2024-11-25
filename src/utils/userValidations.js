export const validateUserData = (formData) => {
  const errors = [];
  
  // Validação do nome
  if (!formData.userName?.trim()) {
    errors.push('Nome é obrigatório');
  } else if (formData.userName.length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  // Validação do CPF
  if (!formData.userCPF?.trim()) {
    errors.push('CPF é obrigatório');
  } else {
    const cpfClean = formData.userCPF.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
    }
  }

  // Validação da empresa
  if (!formData.company) {
    errors.push('Empresa é obrigatória');
  }

  // Validação do turno
  if (!formData.selectedTurno) {
    errors.push('Turno é obrigatório');
  }

  // Validação do voucher
  if (!formData.voucher?.trim()) {
    errors.push('Voucher é obrigatório');
  } else if (formData.voucher.length !== 4) {
    errors.push('Voucher deve ter 4 dígitos');
  }

  return errors;
};

export const formatCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
};