import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Upload, Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [userCPF, setUserCPF] = useState("");
  const [voucher, setVoucher] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState("");
  const [searchCPF, setSearchCPF] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleSaveUser = () => {
    if (!voucher) {
      toast.error("Por favor, gere um voucher antes de salvar o usuário.");
      return;
    }
    if (!selectedTurno) {
      toast.error("Por favor, selecione um turno para o usuário.");
      return;
    }
    console.log('Salvando usuário:', { userName, userCPF, voucher, isSuspended, userPhoto, turno: selectedTurno });
    toast.success("Usuário salvo com sucesso!");
    setUserName("");
    setUserCPF("");
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
    // Simulating a search operation
    if (searchCPF.length === 14) {
      // In a real application, you would fetch user data from the backend here
      setUserName("Usuário Exemplo");
      setUserCPF(searchCPF);
      setVoucher("1234");
      setIsSuspended(false);
      setSelectedTurno("central");
      setIsDialogOpen(true);
      toast.success("Usuário encontrado!");
    } else {
      toast.error("Por favor, insira um CPF válido para pesquisar.");
    }
  };

  return (
    <form className="space-y-4">
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
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="space-y-2">
              <Label>Turno</Label>
              <RadioGroup value={selectedTurno} onValueChange={setSelectedTurno}>
                {turnos.map((turno) => (
                  <div key={turno.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={turno.id} id={turno.id} />
                    <Label htmlFor={turno.id}>
                      {turno.label} ({turno.entrada} - {turno.saida})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
            <Button type="button" onClick={handleSaveUser}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

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
      <div className="space-y-2">
        <Label>Turno</Label>
        <RadioGroup value={selectedTurno} onValueChange={setSelectedTurno}>
          {turnos.map((turno) => (
            <div key={turno.id} className="flex items-center space-x-2">
              <RadioGroupItem value={turno.id} id={turno.id} />
              <Label htmlFor={turno.id}>
                {turno.label} ({turno.entrada} - {turno.saida})
              </Label>
            </div>
          ))}
        </RadioGroup>
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
