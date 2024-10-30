import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import UserSearchDialog from './UserSearchDialog';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveUser = async () => {
    try {
      const response = await api.post('/users', {
        name: formData.userName,
        email: formData.userEmail,
        cpf: formData.userCPF,
        company_id: formData.company,
        voucher: formData.voucher,
        turno: formData.selectedTurno,
        is_suspended: formData.isSuspended
      });

      if (response.data) {
        toast.success("Usuário cadastrado com sucesso!");
        resetForm();
      }
    } catch (error) {
      toast.error("Erro ao cadastrar usuário: " + (error.response?.data?.error || error.message));
    }
  };

  const handleSearch = async (searchCPF) => {
    try {
      const response = await api.get(`/users/search?cpf=${searchCPF}`);
      
      if (response.data) {
        setFormData({
          userName: response.data.name,
          userEmail: response.data.email,
          userCPF: response.data.cpf,
          company: response.data.company_id,
          voucher: response.data.voucher,
          selectedTurno: response.data.turno,
          isSuspended: response.data.is_suspended,
          userPhoto: response.data.photo
        });
        toast.success("Usuário encontrado!");
      }
    } catch (error) {
      toast.error("Erro ao buscar usuário: " + (error.response?.data?.error || error.message));
    }
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
      <UserSearchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default UserForm;