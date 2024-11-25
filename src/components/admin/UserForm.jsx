import React from 'react';
import { useUserForm } from '../../hooks/useUserForm';
import UserFormFields from './user/UserFormFields';

const UserForm = () => {
  const { formData, isSubmitting, handleInputChange, handleSave } = useUserForm();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cadastro de Usuários</h2>
      <UserFormFields
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserForm;