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

  const handleSave = async () => {
    if (isSubmitting) {
      toast.warning('Uma operação já está em andamento');
      return;
    }

    const validationErrors = validateUserData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      logger.info('Iniciando verificação de usuário existente:', { cpf: cleanCPF });
      
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError) {
        logger.error('Erro ao verificar usuário existente:', searchError);
        throw new Error('Erro ao verificar usuário existente');
      }

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

      const operation = existingUser?.id ? 'update' : 'insert';
      
      logger.info(`Iniciando operação ${operation}:`, userData);

      let query = supabase.from('usuarios');
      
      if (operation === 'update') {
        query = query.update(userData).eq('id', existingUser.id);
      } else {
        query = query.insert(userData);
      }

      const { data, error } = await query.select().single();

      if (error) {
        logger.error(`Erro na operação ${operation}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        if (error.code === '23505') {
          throw new Error('CPF já cadastrado no sistema');
        }
        if (error.code === '23503') {
          throw new Error('Empresa ou turno selecionado não existe no sistema');
        }
        
        throw new Error(`Erro na operação ${operation}: ${error.message}`);
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
      
      if (error.message.includes('CPF já cadastrado')) {
        toast.error('Este CPF já está cadastrado no sistema');
      } else if (error.message.includes('empresa ou turno')) {
        toast.error('Empresa ou turno selecionado é inválido');
      } else if (error.message.includes('foreign key constraint')) {
        toast.error('Erro de relacionamento: verifique se a empresa e o turno existem');
      } else {
        toast.error(`Erro ao processar operação: ${error.message}`);
      }
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