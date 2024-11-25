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

  const validateFormData = () => {
    const validationErrors = validateUserData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFormData()) return;

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

      logger.info('Dados preparados para operação:', userData);

      // Realiza a operação de inserção ou atualização
      const operation = existingUser?.id ? 'update' : 'insert';
      const { data, error } = await supabase
        .from('usuarios')
        [operation](userData)
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
        
        // Log detalhado do erro
        logger.error('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        throw new Error(`Erro ao ${operation === 'insert' ? 'cadastrar' : 'atualizar'} usuário: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da operação');
      }

      logger.info(`Usuário ${operation === 'insert' ? 'cadastrado' : 'atualizado'} com sucesso:`, {
        id: data.id,
        nome: data.nome
      });

      toast.success(existingUser?.id ? 
        'Usuário atualizado com sucesso!' : 
        'Usuário cadastrado com sucesso!'
      );
      
      resetForm();
      
    } catch (error) {
      logger.error('Erro ao processar operação:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao processar operação. ';
      
      if (error.message.includes('CPF já cadastrado')) {
        errorMessage = 'Este CPF já está cadastrado no sistema.';
      } else if (error.message.includes('empresa ou turno')) {
        errorMessage = 'Empresa ou turno selecionado é inválido.';
      } else if (error.message.includes('foreign key constraint')) {
        errorMessage = 'Erro de relacionamento: verifique se a empresa e o turno existem.';
      } else {
        errorMessage += 'Por favor, verifique os dados e tente novamente.';
      }
      
      toast.error(errorMessage);
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