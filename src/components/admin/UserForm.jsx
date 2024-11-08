import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import api from '../../utils/api';
import logger from '../../config/logger';

const UserForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userCPF: "",
    company: "",
    voucher: "",
    selectedTurno: "",
    isSuspended: false,
    userPhoto: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.userName || !formData.userEmail || !formData.userCPF || !formData.company || !formData.voucher || !formData.selectedTurno) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }

    if (!formData.userEmail.includes('@')) {
      toast.error("Por favor, insira um email válido");
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
      
      const userData = {
        name: formData.userName,
        email: formData.userEmail,
        cpf: formData.userCPF.replace(/\D/g, ''), // Remove caracteres não numéricos do CPF
        company_id: parseInt(formData.company),
        voucher: formData.voucher,
        turno: formData.selectedTurno,
        is_suspended: formData.isSuspended,
        photo: formData.userPhoto instanceof File ? await convertToBase64(formData.userPhoto) : formData.userPhoto
      };

      let response;
      const endpoint = `/api/users${formData.id ? `/${formData.id}` : ''}`;
      const method = formData.id ? 'put' : 'post';

      response = await api[method](endpoint, userData);

      if (response.data.success) {
        toast.success(formData.id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
        resetForm();
      } else {
        throw new Error(response.data.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Erro ao salvar usuário";
      toast.error(errorMessage);
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

  const resetForm = () => {
    setFormData({
      userName: "",
      userEmail: "",
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