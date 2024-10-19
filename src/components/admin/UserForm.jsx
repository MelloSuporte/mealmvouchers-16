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
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = '';
    for (let i = 0; i < 4; i++) {
      const index = Math.floor(Math.random() * digits.length);
      result += digits[index];
      digits.splice(index, 1);
    }
    return result;
  };

  const handleSaveUser = () => {
    const newVoucher = generateVoucher();
    setVoucher(newVoucher);
    console.log('Salvando usuário:', { userName, userCPF, voucher: newVoucher, isSuspended, userPhoto });
    // Aqui você implementaria a lógica para salvar os dados do usuário, incluindo a foto
    toast.success("Usuário salvo com sucesso!");
    setUserName("");
    setUserCPF("");
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