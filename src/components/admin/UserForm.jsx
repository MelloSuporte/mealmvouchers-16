import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import { supabase } from '@/config/supabase';
import logger from '../../config/logger';
import { generateUniqueVoucherFromCPF } from '../../utils/voucherGenerationUtils';

const UserForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userCPF: "",
    company: "",
    voucher: "",
    selectedTurno: "",
    isSuspended: false,
    userPhoto: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.userName || !formData.userCPF || !formData.company || !formData.selectedTurno) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.userCPF)) {
      toast.error("Por favor, insira um CPF válido no formato XXX.XXX.XXX-XX");
      return false;
    }

    return true;
  };

  const handleSaveUser = async () => {
    if (!validateForm() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', formData.userCPF.replace(/\D/g, ''))
        .single();
      
      // Sempre gera um novo voucher, seja para usuário novo ou existente
      const voucher = await generateUniqueVoucherFromCPF(formData.userCPF.replace(/\D/g, ''));
      
      const updatedFormData = {
        ...formData,
        voucher: voucher
      };
      
      setFormData(updatedFormData);

      // Buscar o ID do turno baseado no tipo_turno selecionado
      const { data: turnoData, error: turnoError } = await supabase
        .from('turnos')
        .select('id')
        .eq('tipo_turno', updatedFormData.selectedTurno)
        .single();

      if (turnoError) {
        throw new Error('Erro ao buscar ID do turno');
      }

      // Garantir que empresa_id seja um número
      const empresaId = parseInt(updatedFormData.company);
      if (isNaN(empresaId)) {
        throw new Error('ID da empresa inválido');
      }

      const userData = {
        nome: updatedFormData.userName.trim(),
        cpf: updatedFormData.userCPF.replace(/\D/g, ''),
        empresa_id: empresaId,
        voucher: voucher,
        turno_id: turnoData.id,
        suspenso: updatedFormData.isSuspended,
        foto: updatedFormData.userPhoto instanceof File ? await convertToBase64(updatedFormData.userPhoto) : updatedFormData.userPhoto
      };

      let response;
      if (existingUser) {
        // Atualizar usuário existente com o novo voucher
        response = await supabase
          .from('usuarios')
          .update(userData)
          .eq('id', existingUser.id)
          .select('*, empresas(*)')
          .single();
      } else {
        // Criar novo usuário
        response = await supabase
          .from('usuarios')
          .insert([userData])
          .select('*, empresas(*)')
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      toast.success(existingUser ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
      clearForm();
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar usuário');
      logger.error('Erro ao salvar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const clearForm = () => {
    setFormData({
      userName: "",
      userCPF: "",
      company: "",
      voucher: "",
      selectedTurno: "",
      isSuspended: false,
      userPhoto: null
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <UserFormMain
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSaveUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserForm;