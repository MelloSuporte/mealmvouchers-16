import React from 'react';
import { useUserForm } from '../../hooks/useUserForm';
import UserFormFields from './user/UserFormFields';
import UserSearchSection from './user/UserSearchSection';

const UserForm = () => {
  const { 
    formData, 
    isSubmitting, 
    handleInputChange, 
    handleSave,
    searchCPF,
    setSearchCPF,
    handleSearch,
    isSearching,
    showVoucher,
    handleVoucherToggle
  } = useUserForm();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cadastro de Usuários</h2>
      
      <UserSearchSection 
        searchCPF={searchCPF}
        setSearchCPF={setSearchCPF}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      <UserFormFields
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        showVoucher={showVoucher}
        onToggleVoucher={handleVoucherToggle}
      />
    </div>
  );
};

export default UserForm;