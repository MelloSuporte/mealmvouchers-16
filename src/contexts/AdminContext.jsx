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
      console.log('Checking admin authentication...');
      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      
      console.log('Admin token:', adminToken);
      console.log('Stored type:', storedType);

      if (adminToken) {
        setIsAuthenticated(true);
        setAdminType(storedType || 'master');
        console.log('Admin authenticated as:', storedType || 'master');
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        console.log('Admin not authenticated');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      toast.error("Erro ao verificar autenticação");
      setIsAuthenticated(false);
      setAdminType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('AdminProvider mounted');
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminType');
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

  console.log('AdminProvider state:', value);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;