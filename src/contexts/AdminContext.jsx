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
  const [adminPermissions, setAdminPermissions] = useState({
    manage_extra_vouchers: false,
    manage_disposable_vouchers: false,
    manage_users: false,
    manage_reports: false
  });

  const checkMasterAdmin = () => {
    const adminToken = localStorage.getItem('adminToken');
    return adminToken === '0001000'; // Token do admin master
  };

  const value = {
    isMasterAdmin: checkMasterAdmin(),
    adminPermissions,
    setAdminPermissions,
    setIsMasterAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};