import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminContext = createContext(null);

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
    manage_extra_vouchers: true,
    manage_disposable_vouchers: true,
    manage_users: true,
    manage_reports: true,
    manage_companies: true,
    manage_meals: true,
    manage_backgrounds: true,
    manage_turnos: true,
    manage_managers: true,
    manage_system: true,
    full_access: true
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');
    const storedPermissions = localStorage.getItem('adminPermissions');

    if (adminToken === 'master-admin-token' || adminType === 'master') {
      setIsMasterAdmin(true);
      const masterPermissions = {
        manage_extra_vouchers: true,
        manage_disposable_vouchers: true,
        manage_users: true,
        manage_reports: true,
        manage_companies: true,
        manage_meals: true,
        manage_backgrounds: true,
        manage_turnos: true,
        manage_managers: true,
        manage_system: true,
        full_access: true
      };
      setAdminPermissions(masterPermissions);
      localStorage.setItem('adminPermissions', JSON.stringify(masterPermissions));
    } else if (adminToken && storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        setAdminPermissions(parsedPermissions);
      } catch (error) {
        console.error('Erro ao processar permissões:', error);
        // Em caso de erro, define permissões padrão
        const defaultPermissions = {
          manage_extra_vouchers: true,
          manage_disposable_vouchers: true,
          manage_users: true,
          manage_reports: true
        };
        setAdminPermissions(defaultPermissions);
        localStorage.setItem('adminPermissions', JSON.stringify(defaultPermissions));
      }
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