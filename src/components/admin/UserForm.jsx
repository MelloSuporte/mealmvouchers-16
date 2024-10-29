import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import UserSearchDialog from './UserSearchDialog';
import axios from 'axios';

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {
        nome: formData.userName,
        email: formData.userEmail,
        cpf: formData.userCPF,
        empresa_id: formData.company,
        voucher: formData.voucher,
        turno: formData.selectedTurno,
        suspenso: formData.isSuspended
      });

      toast.success("Usuário cadastrado com sucesso!");
      resetForm();
    } catch (error) {
      toast.error("Erro ao cadastrar usuário: " + error.message);
    }
  };

  const handleSearch = async (searchCPF) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/search`, {
        params: { cpf: searchCPF }
      });
      
      if (response.data) {
        const user = response.data;
        setFormData({
          userName: user.nome,
          userEmail: user.email,
          userCPF: user.cpf,
          company: user.empresa_id,
          voucher: user.voucher,
          selectedTurno: user.turno,
          isSuspended: user.suspenso,
          userPhoto: user.foto
        });
        toast.success("Usuário encontrado!");
      } else {
        toast.error("Usuário não encontrado.");
      }
    } catch (error) {
      toast.error("Erro ao buscar usuário: " + error.message);
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