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

    if (field === 'userCPF' && value.length >= 11) {
      try {
        const voucherCode = await generateUniqueVoucherFromCPF(value);
        setFormData(prev => ({
          ...prev,
          voucher: voucherCode
        }));
      } catch (error) {
        logger.error('Erro ao gerar voucher:', error);
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
      
      // Verificar se o usuário já existe
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError) {
        logger.error('Erro ao buscar usuário:', searchError);
        throw new Error('Erro ao verificar usuário existente: ' + searchError.message);
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

      let response;

      // Atualiza ou cria usuário baseado na existência
      if (existingUser?.id) {
        response = await supabase
          .from('usuarios')
          .update(newUserData)
          .eq('id', existingUser.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from('usuarios')
          .insert([newUserData])
          .select()
          .single();
      }

      if (response.error) {
        logger.error('Erro na operação do banco:', response.error);
        
        if (response.error.code === '23505') {
          toast.error('CPF já cadastrado no sistema');
          return;
        }
        
        if (response.error.code === '23503') {
          toast.error('Empresa ou turno selecionado não existe no sistema');
          return;
        }

        throw new Error(response.error.message || 'Erro desconhecido');
      }

      if (!response.data) {
        throw new Error('Erro: Nenhum dado retornado da operação');
      }

      toast.success(existingUser?.id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");

      // Limpa o formulário após sucesso
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
      
      if (error.code === '23505') {
        toast.error('CPF já cadastrado no sistema');
      } else if (error.code === '23503') {
        toast.error('Erro: Empresa ou turno selecionado não existe');
      } else if (error.message?.includes('network')) {
        toast.error('Erro de conexão. Por favor, verifique sua internet e tente novamente.');
      } else if (error.message?.includes('timeout')) {
        toast.error('A operação excedeu o tempo limite. Por favor, tente novamente.');
      } else {
        toast.error(`Erro ao processar operação: ${error.message || 'Erro desconhecido'}`);
      }
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