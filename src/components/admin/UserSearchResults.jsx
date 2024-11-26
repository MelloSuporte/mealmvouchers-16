import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const UserSearchResults = ({ userData, onUpdate, onClose }) => {
  const [name, setName] = useState(userData.name);
  const [cpf, setCpf] = useState(userData.cpf);
  const [voucher, setVoucher] = useState(userData.voucher);
  const [isSuspended, setIsSuspended] = useState(userData.isSuspended);
  const [tiposTurno, setTiposTurno] = useState(userData.tipos_turno);
  const [photo, setPhoto] = useState(userData.photo);

  const turnos = [
    { id: "central", label: "Turno Central", entrada: "08:00", saida: "17:00" },
    { id: "primeiro", label: "Primeiro Turno", entrada: "06:00", saida: "14:00" },
    { id: "segundo", label: "Segundo Turno", entrada: "14:00", saida: "22:00" },
    { id: "terceiro", label: "Terceiro Turno", entrada: "22:00", saida: "06:00" },
  ];

  const handleSave = () => {
    onUpdate({ name, cpf, voucher, isSuspended, tipos_turno: tiposTurno, photo });
  };

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Nome do usuário" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input 
        placeholder="CPF" 
        value={cpf}
        readOnly
      />
      <Input 
        placeholder="Voucher" 
        value={voucher}
        onChange={(e) => setVoucher(e.target.value)}
      />
      <div className="space-y-2">
        <Label>Turno</Label>
        <RadioGroup value={tiposTurno} onValueChange={setTiposTurno}>
          {turnos.map((t) => (
            <div key={t.id} className="flex items-center space-x-2">
              <RadioGroupItem value={t.id} id={t.id} />
              <Label htmlFor={t.id}>
                {t.label} ({t.entrada} - {t.saida})
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={isSuspended}
          onCheckedChange={setIsSuspended}
        />
        <Label htmlFor="suspend-user">Suspender acesso</Label>
      </div>
      {photo && <img src={photo} alt="User" className="w-20 h-20 rounded-full object-cover" />}
      <div className="flex space-x-2">
        <Button onClick={handleSave}>Salvar Alterações</Button>
        <Button onClick={onClose} variant="outline">Cancelar</Button>
      </div>
    </div>
  );
};

export default UserSearchResults;