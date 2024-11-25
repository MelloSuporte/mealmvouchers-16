export const validateUserData = (formData) => {
  const errors = [];
  
  if (!formData.userName?.trim()) {
    errors.push('Nome é obrigatório');
  } else if (formData.userName.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  } else if (formData.userName.trim().length > 255) {
    errors.push('Nome não pode ter mais de 255 caracteres');
  }

  if (!formData.userCPF?.trim()) {
    errors.push('CPF é obrigatório');
  } else {
    const cpfClean = formData.userCPF.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
    } else if (!/^\d{11}$/.test(cpfClean)) {
      errors.push('CPF deve conter apenas números');
    }
  }

  if (!formData.company) {
    errors.push('Empresa é obrigatória');
  } else if (isNaN(parseInt(formData.company))) {
    errors.push('ID da empresa inválido');
  }

  if (!formData.selectedTurno) {
    errors.push('Turno é obrigatório');
  } else if (isNaN(parseInt(formData.selectedTurno))) {
    errors.push('ID do turno inválido');
  }

  if (!formData.voucher?.trim()) {
    errors.push('Voucher é obrigatório');
  } else if (formData.voucher.trim().length !== 4) {
    errors.push('Voucher deve ter exatamente 4 dígitos');
  } else if (!/^\d{4}$/.test(formData.voucher.trim())) {
    errors.push('Voucher deve conter apenas números');
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