import { useUserFormState } from './useUserFormState';
import { useUserFormHandlers } from './useUserFormHandlers';

export const useUserForm = () => {
  const {
    isSubmitting,
    setIsSubmitting,
    isSearching,
    setIsSearching,
    searchCPF,
    setSearchCPF,
    showVoucher,
    setShowVoucher,
    formData,
    setFormData
  } = useUserFormState();

  const {
    handleInputChange,
    handleVoucherToggle,
    handleSearch,
    handleSave
  } = useUserFormHandlers(
    formData,
    setFormData,
    setIsSubmitting,
    setIsSearching,
    setShowVoucher
  );

  return {
    formData,
    isSubmitting,
    searchCPF,
    setSearchCPF,
    handleSearch: () => handleSearch(searchCPF),
    isSearching,
    handleInputChange,
    handleSave,
    showVoucher,
    handleVoucherToggle
  };
};