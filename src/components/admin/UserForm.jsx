import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [userCPF, setUserCPF] = useState("");
  const [voucher, setVoucher] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

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
    } while (isVoucherUsed(newVoucher)); // Simula a verificação de unicidade

    setVoucher(newVoucher);
    toast.success("Novo voucher gerado com sucesso!");
  };

  // Simulação de verificação de unicidade do voucher
  const isVoucherUsed = (voucher) => {
    // Aqui você implementaria a lógica real para verificar se o voucher já existe no banco de dados
    return Math.random() < 0.1; // 10% de chance de "colisão" para simular a necessidade de regeneração
  };

  const handleSaveUser = () => {
    if (!voucher) {
      toast.error("Por favor, gere um voucher antes de salvar o usuário.");
      return;
    }
    console.log('Salvando usuário:', { userName, userCPF, voucher, isSuspended, userPhoto });
    toast.success("Usuário salvo com sucesso!");
    // Resetar os campos após salvar
    setUserName("");
    setUserCPF("");
    setVoucher("");
    setIsSuspended(false);
    setUserPhoto(null);
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

  return (
    <form className="space-y-4">
      <Input 
        placeholder="Nome do usuário" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={userCPF}
        onChange={handleCPFChange}
      />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Voucher" 
          value={showVoucher ? voucher : '****'}
          readOnly
        />
        <Button type="button" onClick={toggleVoucherVisibility}>
          {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
        <Button type="button" onClick={generateVoucher}>
          Gerar Voucher
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={isSuspended}
          onCheckedChange={handleSuspendUser}
        />
        <Label htmlFor="suspend-user">Suspender acesso</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
        />
        <Button type="button" onClick={() => document.getElementById('photo-upload').click()}>
          <Upload size={20} className="mr-2" />
          Upload Foto
        </Button>
        {userPhoto && <img src={userPhoto} alt="User" className="w-10 h-10 rounded-full object-cover" />}
      </div>
      <Button type="button" onClick={handleSaveUser}>Cadastrar Usuário</Button>
    </form>
  );
};

export default UserForm;