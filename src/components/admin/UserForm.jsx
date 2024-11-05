import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import api from '../../utils/api';

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

  const handleSaveUser = async () => {
    try {
      const userData = {
        name: formData.userName,
        email: formData.userEmail,
        cpf: formData.userCPF,
        company_id: formData.company,
        voucher: formData.voucher,
        turno: formData.selectedTurno,
        is_suspended: formData.isSuspended,
        photo: formData.userPhoto instanceof File ? await convertToBase64(formData.userPhoto) : formData.userPhoto
      };

      let response;
      if (formData.userCPF) {
        // Atualizar usuário existente
        response = await api.put(`/users/${formData.userCPF}`, userData);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário
        response = await api.post('/users', userData);
        toast.success("Usuário cadastrado com sucesso!");
      }

      if (response.data.success) {
        resetForm();
      }
    } catch (error) {
      toast.error("Erro ao salvar usuário: " + (error.response?.data?.error || error.message));
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
      />
    </div>
  );
};

export default UserForm;