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
      const query = `
        INSERT INTO users (name, email, cpf, company, voucher, turno, is_suspended)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        formData.userName,
        formData.userEmail,
        formData.userCPF,
        formData.company,
        formData.voucher,
        formData.selectedTurno,
        formData.isSuspended
      ];

      await executeQuery(query, params);
      toast.success("Usuário cadastrado com sucesso!");
      resetForm();
    } catch (error) {
      toast.error("Erro ao cadastrar usuário: " + error.message);
    }
  };

  const handleSearch = async (searchCPF) => {
    try {
      const query = 'SELECT * FROM users WHERE cpf = ?';
      const results = await executeQuery(query, [searchCPF]);
      
      if (results.length > 0) {
        setFormData({
          userName: results[0].name,
          userEmail: results[0].email,
          userCPF: results[0].cpf,
          company: results[0].company,
          voucher: results[0].voucher,
          selectedTurno: results[0].turno,
          isSuspended: results[0].is_suspended,
          userPhoto: results[0].photo
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

  return (
    <div className="space-y-4">
      <UserFormMain
        formData={formData}
        setFormData={setFormData}
        handleSaveUser={handleSaveUser}
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