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
    manage_extra_vouchers: false,
    manage_disposable_vouchers: false,
    manage_users: false,
    manage_reports: false
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    if (adminToken === 'master-admin-token' || adminType === 'master') {
      setIsMasterAdmin(true);
      setAdminPermissions({
        manage_extra_vouchers: true,
        manage_disposable_vouchers: true,
        manage_users: true,
        manage_reports: true
      });
    } else if (adminToken) {
      const storedPermissions = localStorage.getItem('adminPermissions');
      if (storedPermissions) {
        setAdminPermissions(JSON.parse(storedPermissions));
      } else {
        api.get('/api/admin/permissions')
          .then(response => {
            setAdminPermissions(response.data);
          })
          .catch(error => {
            console.error('Error fetching admin permissions:', error);
          });
      }
    }
  }, []);

  // Função protegida para atualizar permissões
  const updateAdminPermissions = (newPermissions) => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    // Impede alterações se não houver token ou se não for admin master
    if (!adminToken || (adminType !== 'master' && adminToken !== 'master-admin-token')) {
      console.error('Tentativa não autorizada de modificar permissões de admin');
      return;
    }

    setAdminPermissions(newPermissions);
  };

  // Função protegida para atualizar status de admin master
  const updateMasterAdminStatus = (status) => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    // Impede alterações se não houver token ou se não for admin master
    if (!adminToken || (adminType !== 'master' && adminToken !== 'master-admin-token')) {
      console.error('Tentativa não autorizada de modificar status de admin master');
      return;
    }

    setIsMasterAdmin(status);
  };

  const value = {
    isMasterAdmin,
    adminPermissions,
    setAdminPermissions: updateAdminPermissions,
    setIsMasterAdmin: updateMasterAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};