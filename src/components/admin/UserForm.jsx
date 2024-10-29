import React, { useState } from 'react';
import mysql from 'mysql2/promise';
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
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      await connection.execute(
        'INSERT INTO usuarios (nome, email, cpf, empresa_id, voucher, turno, suspenso) VALUES (?, ?, ?, ?, ?, ?, ?)',
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

      await connection.end();

      toast.success("Usuário cadastrado com sucesso!");
      resetForm();
    } catch (error) {
      toast.error("Erro ao cadastrar usuário: " + error.message);
    }
  };

  const handleSearch = async (searchCPF) => {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [rows] = await connection.execute('SELECT * FROM usuarios WHERE cpf = ?', [searchCPF]);
      
      await connection.end();

      if (rows.length > 0) {
        const user = rows[0];
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