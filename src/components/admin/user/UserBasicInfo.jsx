import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserBasicInfo = ({ formData, onInputChange, handleCPFChange }) => {
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
        <Label htmlFor="userEmail">E-mail</Label>
        <Input
          id="userEmail"
          type="email"
          placeholder="email@exemplo.com"
          value={formData.userEmail}
          onChange={(e) => onInputChange('userEmail', e.target.value)}
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