import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const defaultTurnos = [
  { id: "central", label: "Turno Central", entrada: "08:00", saida: "17:00" },
  { id: "primeiro", label: "Primeiro Turno", entrada: "06:00", saida: "14:00" },
  { id: "segundo", label: "Segundo Turno", entrada: "14:00", saida: "22:00" },
  { id: "terceiro", label: "Terceiro Turno", entrada: "22:00", saida: "06:00" }
];

const UserFormMain = ({
  userName = '',
  setUserName,
  userEmail = '',
  setUserEmail,
  userCPF = '',
  handleCPFChange,
  company = '',
  setCompany,
  voucher = '',
  showVoucher = false,
  toggleVoucherVisibility,
  generateVoucher,
  selectedTurno = '',
  setSelectedTurno,
  isSuspended = false,
  handleSuspendUser,
  handlePhotoUpload,
  userPhoto,
  handleSaveUser,
  turnos = defaultTurnos
}) => {
  return (
    <form className="space-y-4">
      <Input 
        placeholder="Nome do usuário" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Input 
        placeholder="E-mail do usuário" 
        type="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={userCPF}
        onChange={handleCPFChange}
      />
      <Input 
        placeholder="Empresa" 
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
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

export default UserFormMain;