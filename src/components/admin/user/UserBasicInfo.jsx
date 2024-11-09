import React from 'react';
import { Input } from "@/components/ui/input";

const UserBasicInfo = ({ formData, onInputChange, handleCPFChange }) => {
  return (
    <>
      <Input 
        placeholder="Nome do usuário" 
        value={formData.userName}
        onChange={(e) => onInputChange('userName', e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={formData.userCPF}
        onChange={handleCPFChange}
      />
    </>
  );
};

export default UserBasicInfo;