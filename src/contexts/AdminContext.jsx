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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = () => {
      try {
        const storedType = localStorage.getItem('adminType');
        
        if (storedType) {
          setAdminType(storedType);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar admin:', error);
        toast.error("Erro ao carregar dados do administrador");
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const hasPermission = () => {
    return adminType === 'master' || adminType === 'manager';
  };

  const value = {
    isMasterAdmin: adminType === 'master',
    isManager: adminType === 'manager',
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