import { useState, useCallback } from 'react';

export const useVoucherVisibility = () => {
  const [showVoucher, setShowVoucher] = useState(false);

  const handleVoucherToggle = useCallback((value) => {
    setShowVoucher(value);
  }, []);

  return {
    showVoucher,
    handleVoucherToggle
  };
};