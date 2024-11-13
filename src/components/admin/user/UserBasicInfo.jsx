import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserBasicInfo = ({ formData, onInputChange }) => {
  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    onInputChange('userCPF', formattedCPF);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userName">Nome completo</Label>
        <Input
          id="userName"
          placeholder="Nome completo"
          value={formData.userName}
          onChange={(e) => onInputChange('userName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userCPF">CPF</Label>
        <Input
          id="userCPF"
          placeholder="000.000.000-00"
          value={formData.userCPF}
          onChange={handleCPFChange}
          maxLength={14}
        />
      </div>
    </div>
  );
};

export default UserBasicInfo;