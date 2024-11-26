import { toast } from "sonner";
import logger from '../../config/logger';

export const validateUserData = (formData) => {
  const errors = [];
  
  if (!formData.userName.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (!formData.userCPF.trim()) {
    errors.push('CPF é obrigatório');
  }
  
  if (!formData.company) {
    errors.push('Empresa é obrigatória');
  }
  
  if (!formData.selectedTurno) {
    errors.push('Turno é obrigatório');
  }
  
  if (!formData.voucher.trim()) {
    errors.push('Voucher é obrigatório');
  }
  
  return errors;
};

export const handleValidationErrors = (errors) => {
  errors.forEach(error => {
    toast.error(error);
    logger.error(`Erro de validação: ${error}`);
  });
  return errors.length === 0;
};