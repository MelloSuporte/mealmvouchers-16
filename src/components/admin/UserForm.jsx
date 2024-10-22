import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from 'axios';
import UserFormMain from './UserFormMain';

const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCPF, setUserCPF] = useState("");
  const [company, setCompany] = useState("");
  const [voucher, setVoucher] = useState("");
  const [selectedTurno, setSelectedTurno] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);

  const handleSaveUser = async () => {
    if (!voucher) {
      toast.error("Por favor, gere um voucher antes de salvar o usuário.");
      return;
    }
    if (!selectedTurno) {
      toast.error("Por favor, selecione um turno para o usuário.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/users', {
        name: userName,
        email: userEmail,
        cpf: userCPF,
        company,
        voucher,
        turno: selectedTurno,
        isSuspended
      });
      console.log('Usuário salvo:', response.data);
      toast.success("Usuário salvo com sucesso!");
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error("Erro ao salvar usuário. Por favor, tente novamente.");
    }
  };

  const resetForm = () => {
    setUserName("");
    setUserEmail("");
    setUserCPF("");
    setCompany("");
    setVoucher("");
    setIsSuspended(false);
    setSelectedTurno("");
  };

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      setUserCPF(value);
    }
  };

  const generateVoucher = () => {
    const newVoucher = Math.floor(1000 + Math.random() * 9000).toString();
    setVoucher(newVoucher);
  };

  return (
    <div className="space-y-4">
      <UserFormMain
        userName={userName}
        setUserName={setUserName}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        userCPF={userCPF}
        handleCPFChange={handleCPFChange}
        company={company}
        setCompany={setCompany}
        voucher={voucher}
        generateVoucher={generateVoucher}
        selectedTurno={selectedTurno}
        setSelectedTurno={setSelectedTurno}
        isSuspended={isSuspended}
        handleSuspendUser={() => setIsSuspended(!isSuspended)}
        handleSaveUser={handleSaveUser}
      />
    </div>
  );
};

export default UserForm;
