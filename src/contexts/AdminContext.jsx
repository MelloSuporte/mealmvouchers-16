import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  const checkMasterAdmin = () => {
    const adminToken = localStorage.getItem('adminToken');
    return adminToken === 'admin-authenticated';
  };

  const value = {
    isMasterAdmin: checkMasterAdmin(),
    setIsMasterAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};