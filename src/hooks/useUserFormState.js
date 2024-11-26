import { useState } from 'react';

export const useUserFormState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCPF, setSearchCPF] = useState('');
  const [showVoucher, setShowVoucher] = useState(true);
  const [formData, setFormData] = useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  return {
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
  };
};