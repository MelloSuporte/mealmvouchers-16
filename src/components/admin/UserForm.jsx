import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserSearchResults from './UserSearchResults';
import UserFormMain from './UserFormMain';
import axios from 'axios';

const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCPF, setUserCPF] = useState("");
  const [company, setCompany] = useState("");
  const [voucher, setVoucher] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState("");
  const [searchCPF, setSearchCPF] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const turnos = [
    { id: "central", label: "Turno Central", entrada: "08:00", saida: "17:00" },
    { id: "primeiro", label: "Primeiro Turno", entrada: "06:00", saida: "14:00" },
    { id: "segundo", label: "Segundo Turno", entrada: "14:00", saida: "22:00" },
    { id: "terceiro", label: "Terceiro Turno", entrada: "22:00", saida: "06:00" },
  ];

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      setUserCPF(value);
    }
  };

  const generateVoucher = () => {
    if (userCPF.length !== 14) {
      toast.error("Por favor, insira um CPF válido antes de gerar o voucher.");
      return;
    }

    const cpfDigits = userCPF.replace(/\D/g, '').slice(0, 9);
    let newVoucher;
    do {
      const hash = cpfDigits.split('').reduce((acc, digit) => {
        return (acc * 31 + parseInt(digit)) % 10000;
      }, 0);
      newVoucher = hash.toString().padStart(4, '0');
    } while (isVoucherUsed(newVoucher));

    setVoucher(newVoucher);
    toast.success("Novo voucher gerado com sucesso!");
  };

  const isVoucherUsed = (voucher) => {
    return Math.random() < 0.1;
  };

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
    setUserPhoto(null);
    setSelectedTurno("");
    setIsDialogOpen(false);
  };

  const toggleVoucherVisibility = () => {
    setShowVoucher(!showVoucher);
  };

  const handleSuspendUser = () => {
    setIsSuspended(!isSuspended);
    toast.info(`Usuário ${isSuspended ? 'reativado' : 'suspenso'} com sucesso!`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (searchCPF.length === 14) {
      // Simulating a search operation
      // In a real application, you would fetch user data from the backend here
      setSearchResults({
        name: "Usuário Exemplo",
        cpf: searchCPF,
        voucher: "1234",
        isSuspended: false,
        turno: "central",
        photo: null
      });
      setIsDialogOpen(true);
      toast.success("Usuário encontrado!");
    } else {
      toast.error("Por favor, insira um CPF válido para pesquisar.");
    }
  };

  const handleUpdateUser = (updatedData) => {
    setUserName(updatedData.name);
    setUserCPF(updatedData.cpf);
    setVoucher(updatedData.voucher);
    setIsSuspended(updatedData.isSuspended);
    setSelectedTurno(updatedData.turno);
    setUserPhoto(updatedData.photo);
    setIsDialogOpen(false);
    toast.success("Dados do usuário atualizados com sucesso!");
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
        showVoucher={showVoucher}
        toggleVoucherVisibility={() => setShowVoucher(!showVoucher)}
        generateVoucher={generateVoucher}
        selectedTurno={selectedTurno}
        setSelectedTurno={setSelectedTurno}
        isSuspended={isSuspended}
        handleSuspendUser={() => setIsSuspended(!isSuspended)}
        handlePhotoUpload={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setUserPhoto(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }}
        userPhoto={userPhoto}
        handleSaveUser={handleSaveUser}
        turnos={turnos}
      />

      <div className="flex space-x-2">
        <Input 
          placeholder="Pesquisar por CPF (000.000.000-00)" 
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"))}
        />
        <Button type="button" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> Pesquisar
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado da Pesquisa</DialogTitle>
          </DialogHeader>
          {searchResults && (
            <UserSearchResults
              userData={searchResults}
              onUpdate={handleUpdateUser}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserForm;