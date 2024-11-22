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
      
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      // Buscar turno
      const { data: turnoData, error: turnoError } = await supabase
        .from('turnos')
        .select('id')
        .eq('tipo_turno', formData.selectedTurno)
        .single();

      if (turnoError) {
        logger.error('Erro ao buscar turno:', turnoError);
        toast.error('Erro ao buscar turno');
        return;
      }

      if (!turnoData) {
        toast.error('Turno não encontrado');
        return;
      }

      // Gera um novo voucher
      const voucher = await generateUniqueVoucherFromCPF(cleanCPF);
      
      // Garantir que empresa_id seja um número válido
      const empresaId = parseInt(formData.company);
      if (isNaN(empresaId)) {
        toast.error('ID da empresa inválido');
        return;
      }

      let userPhoto = formData.userPhoto;
      if (formData.userPhoto instanceof File) {
        userPhoto = await convertToBase64(formData.userPhoto);
      }

      const newUserData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: empresaId,
        voucher: voucher,
        turno_id: turnoData.id,
        suspenso: formData.isSuspended,
        foto: userPhoto
      };

      // Buscar usuário existente
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      // Se houver erro que não seja "não encontrado", retornar
      if (searchError && searchError.code !== 'PGRST116') {
        logger.error('Erro ao buscar usuário existente:', searchError);
        toast.error('Erro ao verificar usuário existente');
        return;
      }

      if (existingUser?.id) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('usuarios')
          .update(newUserData)
          .eq('id', existingUser.id);

        if (updateError) {
          logger.error('Erro ao atualizar usuário:', updateError);
          toast.error(`Erro ao atualizar usuário: ${updateError.message}`);
          return;
        }
        
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Inserir novo usuário
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([newUserData]);

        if (insertError) {
          logger.error('Erro ao cadastrar usuário:', insertError);
          toast.error(`Erro ao cadastrar usuário: ${insertError.message}`);
          return;
        }
        
        toast.success("Usuário cadastrado com sucesso!");
      }

      clearForm();
    } catch (error) {
      logger.error('Erro inesperado ao salvar usuário:', error);
      toast.error(`Erro ao salvar usuário: ${error.message}`);
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