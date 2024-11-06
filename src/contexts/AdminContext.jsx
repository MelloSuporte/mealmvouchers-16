import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminType, setAdminType] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = () => {
      try {
        const storedType = localStorage.getItem('adminType');
        const storedPermissions = localStorage.getItem('adminPermissions');

        if (!storedType) {
          setIsLoading(false);
          return;
        }

        if (storedType === 'master') {
          setAdminType('master');
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
          setPermissions(masterPermissions);
          localStorage.setItem('adminPermissions', JSON.stringify(masterPermissions));
        } else if (storedPermissions) {
          setAdminType('manager');
          setPermissions(JSON.parse(storedPermissions));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar admin:', error);
        toast.error("Erro ao carregar permissões");
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const hasPermission = (permission) => {
    if (!permissions) return false;
    if (adminType === 'master') return true;
    return permissions[permission] === true;
  };

  const value = {
    isMasterAdmin: adminType === 'master',
    adminType,
    permissions,
    hasPermission,
    isLoading
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;