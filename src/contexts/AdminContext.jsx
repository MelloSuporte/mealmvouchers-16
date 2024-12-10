import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    try {
      console.log('Verificando autenticação do admin...');
      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      
      console.log('Token:', adminToken);
      console.log('Tipo:', storedType);

      if (adminToken && storedType) {
        setIsAuthenticated(true);
        setAdminType(storedType);
        console.log('Admin autenticado com sucesso como:', storedType);
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        console.log('Admin não autenticado - token ou tipo ausente');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setAdminType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('AdminProvider montado - verificando autenticação');
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    console.log('Realizando logout...');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminType');
    localStorage.removeItem('adminPermissions');
    setIsAuthenticated(false);
    setAdminType(null);
    toast.success("Logout realizado com sucesso");
  }, []);

  const value = {
    adminType,
    isLoading,
    isAuthenticated,
    isMasterAdmin: adminType === 'master',
    isManager: adminType === 'manager' || adminType === 'master',
    hasPermission: (permission) => {
      if (adminType === 'master') return true;
      try {
        const permissions = JSON.parse(localStorage.getItem('adminPermissions') || '{}');
        return permissions[permission] === true;
      } catch {
        return false;
      }
    },
    logout,
    checkAuth
  };

  console.log('Estado atual do AdminProvider:', value);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;