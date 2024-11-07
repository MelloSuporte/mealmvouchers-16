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
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken) {
          setAdminType('master'); // Garante acesso total com token
        } else if (storedType) {
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
    const adminToken = localStorage.getItem('adminToken');
    return adminToken ? true : (adminType === 'master' || adminType === 'manager');
  };

  const value = {
    isMasterAdmin: true, // Garante que sempre será master admin
    isManager: true, // Garante acesso de gerente também
    hasPermission: () => true, // Sempre retorna true para garantir acesso
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