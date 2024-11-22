import React, { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import UserFormMain from './UserFormMain';
import { generateUniqueVoucherFromCPF } from '@/utils/voucherGenerationUtils';

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

  const handleInputChange = async (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Gerar voucher automaticamente quando o CPF é preenchido
    if (field === 'userCPF' && value.length >= 11) {
      try {
        const voucherCode = await generateUniqueVoucherFromCPF(value);
        setFormData(prev => ({
          ...prev,
          voucher: voucherCode
        }));
      } catch (error) {
        toast.error('Erro ao gerar voucher. Por favor, tente novamente.');
      }
    }
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
      
      // Verificar se usuário já existe
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError) {
        logger.error('Erro ao buscar usuário:', searchError);
        throw new Error('Erro ao verificar usuário existente');
      }

      const newUserData = {
        nome: formData.userName,
        cpf: cleanCPF,
        empresa_id: parseInt(formData.company),
        voucher: formData.voucher,
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      if (existingUser?.id) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('usuarios')
          .update(newUserData)
          .eq('id', existingUser.id);

        if (updateError) {
          logger.error('Erro ao atualizar usuário:', updateError);
          if (updateError.code === '23505') {
            throw new Error('CPF já cadastrado para outro usuário');
          }
          throw new Error('Erro ao atualizar usuário. Por favor, verifique os dados e tente novamente.');
        }
        
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Inserir novo usuário
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([newUserData]);

        if (insertError) {
          logger.error('Erro ao inserir usuário:', insertError);
          if (insertError.code === '23505') {
            throw new Error('CPF já cadastrado no sistema');
          }
          throw new Error('Erro ao cadastrar usuário. Por favor, verifique os dados e tente novamente.');
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
      toast.error(error.message || "Erro ao processar operação. Por favor, tente novamente.");
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