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
  const [adminName, setAdminName] = useState(null);

  const checkAuth = useCallback(() => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      const storedName = localStorage.getItem('adminName');
      
      if (adminToken && storedType) {
        setIsAuthenticated(true);
        setAdminType(storedType);
        setAdminName(storedName);
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        setAdminName(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
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
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminPermissions');
    setIsAuthenticated(false);
    setAdminType(null);
    setAdminName(null);
    toast.success("Logout realizado com sucesso");
  }, []);

  const value = {
    adminType,
    adminName,
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