import React, { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import UserFormMain from './UserFormMain';

const UserForm = () => {
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.userName.trim()) {
      errors.push('Nome completo');
    }
    if (!formData.userCPF.trim()) {
      errors.push('CPF');
    }
    if (!formData.company) {
      errors.push('Empresa');
    }
    if (!formData.selectedTurno) {
      errors.push('Turno');
    }
    if (!formData.voucher.trim()) {
      errors.push('Voucher');
    }

    return errors;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      const newUserData = {
        nome: formData.userName,
        cpf: cleanCPF,
        empresa_id: parseInt(formData.company),
        voucher: formData.voucher,
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      // Verificar se usuário já existe
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') {
        logger.error('Erro ao buscar usuário existente:', searchError);
        toast.error('Erro ao verificar usuário existente');
        return;
      }

      let result;
      if (existingUser?.id) {
        // Atualizar usuário existente
        result = await supabase
          .from('usuarios')
          .update(newUserData)
          .eq('id', existingUser.id);

        if (result.error) {
          logger.error('Erro ao atualizar usuário:', result.error);
          toast.error(`Erro ao atualizar usuário: ${result.error.message}`);
          return;
        }
        
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Inserir novo usuário
        result = await supabase
          .from('usuarios')
          .insert([newUserData]);

        if (result.error) {
          logger.error('Erro ao cadastrar usuário:', result.error);
          toast.error(`Erro ao cadastrar usuário: ${result.error.message}`);
          return;
        }

        toast.success("Usuário cadastrado com sucesso!");
      }

      // Limpar formulário após sucesso
      setFormData({
        userName: '',
        userCPF: '',
        company: '',
        selectedTurno: '',
        isSuspended: false,
        userPhoto: null,
        voucher: ''
      });

    } catch (error) {
      logger.error('Erro ao processar operação:', error);
      toast.error("Ocorreu um erro ao processar a operação. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cadastro de Usuários</h2>
      <UserFormMain
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserForm;