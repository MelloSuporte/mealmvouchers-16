import React, { createContext, useContext } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const adminAuth = useAdminAuth();

  return (
    <AdminContext.Provider value={adminAuth}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;