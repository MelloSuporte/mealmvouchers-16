import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaultTurnos = [
  { id: "central", label: "Turno Central", entrada: "08:00", saida: "17:00" },
  { id: "primeiro", label: "Primeiro Turno", entrada: "06:00", saida: "14:00" },
  { id: "segundo", label: "Segundo Turno", entrada: "14:00", saida: "22:00" },
  { id: "terceiro", label: "Terceiro Turno", entrada: "22:00", saida: "06:00" }
];

const UserFormMain = ({
  formData,
  onInputChange,
  onSave,
  turnos = defaultTurnos
}) => {
  const [showVoucher, setShowVoucher] = React.useState(false);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onInputChange('userPhoto', file);
    }
  };

  const generateVoucher = () => {
    if (formData.userCPF) {
      const cpfNumbers = formData.userCPF.replace(/\D/g, '');
      if (cpfNumbers.length >= 5) {
        const newVoucher = cpfNumbers.substring(1, 5);
        onInputChange('voucher', newVoucher);
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <Input 
        placeholder="Nome do usuário" 
        value={formData.userName}
        onChange={(e) => onInputChange('userName', e.target.value)}
      />
      <Input 
        placeholder="E-mail do usuário" 
        type="email"
        value={formData.userEmail}
        onChange={(e) => onInputChange('userEmail', e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={formData.userCPF}
        onChange={(e) => {
          let value = e.target.value.replace(/\D/g, '');
          if (value.length <= 11) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
            onInputChange('userCPF', value);
            if (value.length >= 5) {
              onInputChange('voucher', value.substring(1, 5));
            }
          }
        }}
      />
      <Select 
        value={formData.company} 
        onValueChange={(value) => onInputChange('company', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Voucher" 
          value={showVoucher ? formData.voucher : '****'}
          readOnly
        />
        <Button type="button" onClick={() => setShowVoucher(!showVoucher)}>
          {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
        <Button type="button" onClick={generateVoucher}>
          Gerar Voucher
        </Button>
      </div>
      <Select 
        value={formData.selectedTurno} 
        onValueChange={(value) => onInputChange('selectedTurno', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o turno" />
        </SelectTrigger>
        <SelectContent>
          {turnos.map((turno) => (
            <SelectItem key={turno.id} value={turno.id}>
              {turno.label} ({turno.entrada} - {turno.saida})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={formData.isSuspended}
          onCheckedChange={(checked) => onInputChange('isSuspended', checked)}
        />
        <Label htmlFor="suspend-user">Suspender acesso</Label>
      </div>
      <div className="flex items-center justify-between space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
        />
        <div className="flex space-x-4">
          <Button type="button" onClick={() => document.getElementById('photo-upload').click()}>
            <Upload size={20} className="mr-2" />
            Upload Foto
          </Button>
          <Button type="button" onClick={onSave}>
            Cadastrar Usuário
          </Button>
        </div>
        {formData.userPhoto && (
          <img 
            src={typeof formData.userPhoto === 'string' ? formData.userPhoto : URL.createObjectURL(formData.userPhoto)} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover" 
          />
        )}
      </div>
    </form>
  );
};

export default UserFormMain;