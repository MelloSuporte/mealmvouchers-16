import { useState } from 'react';

export const useUserFormState = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    selectedSetor: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  const [searchCPF, setSearchCPF] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    formData,
    setFormData,
    searchCPF,
    setSearchCPF,
    isSearching,
    setIsSearching,
    isSubmitting,
    setIsSubmitting
  };
};