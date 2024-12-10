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
      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      
      if (adminToken && storedType) {
        setIsAuthenticated(true);
        setAdminType(storedType);
        console.log('Admin autenticado como:', storedType);
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        console.log('Admin não autenticado');
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
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
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

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;