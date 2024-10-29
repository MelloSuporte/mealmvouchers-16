import React, { useState } from 'react';
import { executeQuery } from '../../utils/db';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import UserSearchDialog from './UserSearchDialog';

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
      await executeQuery(
        'INSERT INTO users (name, email, cpf, company, voucher, turno, is_suspended) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          formData.userName,
          formData.userEmail,
          formData.userCPF,
          formData.company,
          formData.voucher,
          formData.selectedTurno,
          formData.isSuspended
        ]
      );
      toast.success("Usuário cadastrado com sucesso!");
      resetForm();
    } catch (error) {
      toast.error("Erro ao cadastrar usuário: " + error.message);
    }
  };

  const handleSearch = async (searchCPF) => {
    try {
      const results = await executeQuery('SELECT * FROM users WHERE cpf = ?', [searchCPF]);
      
      if (results.length > 0) {
        const user = results[0];
        setFormData({
          userName: user.name,
          userEmail: user.email,
          userCPF: user.cpf,
          company: user.company,
          voucher: user.voucher,
          selectedTurno: user.turno,
          isSuspended: user.is_suspended,
          userPhoto: user.photo
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