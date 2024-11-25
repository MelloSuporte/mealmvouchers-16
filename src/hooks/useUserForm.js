import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { validateUserData, formatCPF } from '../utils/userValidations';

export const useUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Formatação especial para CPF
    if (field === 'userCPF') {
      processedValue = formatCPF(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      userCPF: '',
      company: '',
      selectedTurno: '',
      isSuspended: false,
      userPhoto: null,
      voucher: ''
    });
  };

  const handleSave = async () => {
    const validationErrors = validateUserData(formData);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    if (isSubmitting) {
      toast.warning('Uma operação já está em andamento');
      return;
    }

    setIsSubmitting(true);
    logger.info('Iniciando cadastro/atualização de usuário:', { 
      nome: formData.userName,
      empresa: formData.company,
      turno: formData.selectedTurno
    });

    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      // Verifica se o usuário já existe
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError) {
        logger.error('Erro ao verificar usuário existente:', searchError);
        throw new Error(`Erro ao verificar usuário: ${searchError.message}`);
      }

      // Prepara os dados para inserção/atualização
      const userData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: parseInt(formData.company),
        voucher: formData.voucher.trim(),
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      // Realiza a operação de inserção ou atualização
      const operation = existingUser?.id ? 'update' : 'insert';
      const { data, error } = await supabase
        .from('usuarios')
        [operation]([userData])
        .select()
        .single();

      if (error) {
        logger.error(`Erro na operação ${operation}:`, error);
        
        if (error.code === '23505') {
          throw new Error('CPF já cadastrado no sistema');
        }
        if (error.code === '23503') {
          throw new Error('Empresa ou turno selecionado não existe no sistema');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da operação');
      }

      toast.success(existingUser?.id ? 
        'Usuário atualizado com sucesso!' : 
        'Usuário cadastrado com sucesso!'
      );
      resetForm();
      
    } catch (error) {
      logger.error('Erro ao processar operação:', error);
      toast.error(error.message || 'Erro ao processar operação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleSave
  };
};