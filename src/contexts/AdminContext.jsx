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
      const isAuth = localStorage.getItem('isAuthenticated');
      
      if (adminToken && isAuth === 'true') {
        setIsAuthenticated(true);
        setAdminType(storedType || 'master');
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      toast.error("Erro ao verificar autenticação");
      setIsAuthenticated(false);
      setAdminType(null);
    }
  }, []);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        checkAuth();
      } catch (error) {
        console.error('Erro ao inicializar admin:', error);
        toast.error("Erro ao carregar dados do administrador");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminType');
    localStorage.removeItem('isAuthenticated');
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
    hasPermission: () => isAuthenticated,
    logout,
    checkAuth
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;