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
  const [permissions, setPermissions] = useState({});

  const checkTokenExpiration = useCallback(() => {
    const tokenData = localStorage.getItem('adminToken');
    if (!tokenData) return false;

    // Para o admin master, não verificamos expiração
    if (localStorage.getItem('adminType') === 'master') {
      return true;
    }

    // Verifica se o token está expirado (24 horas após criação)
    const lastLoginTime = localStorage.getItem('adminLoginTime');
    if (!lastLoginTime) {
      logger.warn('Tempo de login não encontrado');
      return false;
    }

    const expirationTime = new Date(Number(lastLoginTime) + 24 * 60 * 60 * 1000); // 24 horas
    const isExpired = new Date() > expirationTime;

    if (isExpired) {
      logger.warn('Token expirado:', {
        loginTime: new Date(Number(lastLoginTime)).toISOString(),
        expirationTime: expirationTime.toISOString(),
        currentTime: new Date().toISOString()
      });
    }

    return !isExpired;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const isValid = checkTokenExpiration();
      
      if (!isValid) {
        logger.warn('Sessão expirada ou inválida');
        await logout();
        toast.error("Sessão expirada. Favor fazer login novamente.");
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      const storedType = localStorage.getItem('adminType');
      const storedName = localStorage.getItem('adminName');
      const storedId = localStorage.getItem('adminId');
      const storedPermissions = localStorage.getItem('adminPermissions');
      
      logger.info('Checking auth with stored data:', {
        hasToken: !!adminToken,
        storedType,
        storedName,
        storedId,
        storedPermissions
      });

      if (adminToken && storedType) {
        setIsAuthenticated(true);
        setAdminType(storedType);
        setAdminName(storedName);
        setAdminId(storedId);
        
        try {
          const parsedPermissions = JSON.parse(storedPermissions || '{}');
          logger.info('Parsed permissions:', parsedPermissions);
          setPermissions(parsedPermissions);
        } catch (error) {
          logger.error('Error parsing permissions:', error);
          setPermissions({});
        }

        logger.info('Admin authenticated:', { 
          type: storedType, 
          name: storedName,
          permissions: permissions 
        });
      } else {
        setIsAuthenticated(false);
        setAdminType(null);
        setAdminName(null);
        setAdminId(null);
        setPermissions({});
        logger.warn('No admin token found');
      }
    } catch (error) {
      logger.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenExpiration]);

  useEffect(() => {
    checkAuth();
    // Verifica a autenticação a cada 5 minutos
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminType');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminPermissions');
      localStorage.removeItem('adminLoginTime');
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
      setPermissions({});
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      logger.error('Error during logout:', error);
      toast.error("Erro ao realizar logout");
    }
  }, []);

  const hasPermission = useCallback((permission) => {
    logger.info('Checking permission:', {
      permission,
      adminType,
      currentPermissions: permissions,
      isMaster: adminType === 'master'
    });

    if (adminType === 'master') {
      logger.info('Master admin - permission granted');
      return true;
    }

    const hasPermissionValue = permissions[permission] === true;
    logger.info(`Permission ${permission} result:`, hasPermissionValue);
    return hasPermissionValue;
  }, [adminType, permissions]);

  const value = {
    adminType,
    adminName,
    adminId,
    isLoading,
    isAuthenticated,
    isMasterAdmin: adminType === 'master',
    isManager: adminType === 'manager' || adminType === 'master',
    hasPermission,
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