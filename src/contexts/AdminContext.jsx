import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';

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
  const [adminId, setAdminId] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      const storedName = localStorage.getItem('adminName');
      const storedId = localStorage.getItem('adminId');
      
      if (adminToken && storedType) {
        // Se temos um token admin, consideramos autenticado
        setIsAuthenticated(true);
        setAdminType(storedType);
        setAdminName(storedName);
        setAdminId(storedId);
        logger.info('Admin autenticado:', { type: storedType, name: storedName });
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        setAdminName(null);
        setAdminId(null);
        logger.warn('Sem token de admin encontrado');
      }
    } catch (error) {
      logger.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminType');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminPermissions');
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
      toast.error("Erro ao realizar logout");
    }
  }, []);

  const value = {
    adminType,
    adminName,
    adminId,
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