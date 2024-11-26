import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF } from '../../../utils/formatters';

const UserBasicInfo = ({ formData, onInputChange, disabled }) => {
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
          disabled={disabled}
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
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default UserBasicInfo;