import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const checkMasterAdmin = () => adminToken === '0001000';
    setIsMasterAdmin(checkMasterAdmin());

    // If not master admin, fetch regular admin permissions
    if (adminToken && !checkMasterAdmin()) {
      api.get('/api/admin/permissions')
        .then(response => {
          setAdminPermissions(response.data);
        })
        .catch(error => {
          console.error('Error fetching admin permissions:', error);
        });
    } else if (checkMasterAdmin()) {
      // Master admin has all permissions
      setAdminPermissions({
        manage_extra_vouchers: true,
        manage_disposable_vouchers: true,
        manage_users: true,
        manage_reports: true
      });
    }
  }, []);

  const value = {
    isMasterAdmin,
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