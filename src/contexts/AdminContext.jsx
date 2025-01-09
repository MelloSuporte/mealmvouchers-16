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
    const adminType = localStorage.getItem('adminType');
    
    if (!tokenData) {
      logger.warn('Token não encontrado');
      return false;
    }

    // Admin master tem sessão permanente
    if (adminType === 'master') {
      logger.info('Admin master - sessão permanente');
      return true;
    }

    // Para outros admins, verifica expiração (7 dias)
    const lastLoginTime = localStorage.getItem('adminLoginTime');
    if (!lastLoginTime) {
      logger.warn('Tempo de login não encontrado');
      return false;
    }

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
    const expirationTime = new Date(Number(lastLoginTime) + SEVEN_DAYS);
    const isExpired = new Date() > expirationTime;

    if (isExpired) {
      logger.warn('Token expirado:', {
        loginTime: new Date(Number(lastLoginTime)).toISOString(),
        expirationTime: expirationTime.toISOString(),
        currentTime: new Date().toISOString(),
        adminType
      });
    } else {
      logger.info('Token válido:', {
        loginTime: new Date(Number(lastLoginTime)).toISOString(),
        expirationTime: expirationTime.toISOString(),
        tempoRestante: Math.floor((expirationTime - new Date()) / (1000 * 60 * 60)), // horas restantes
        adminType
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
      
      logger.info('Verificando autenticação:', {
        hasToken: !!adminToken,
        storedType,
        storedName,
        storedId,
        temPermissoes: !!storedPermissions
      });

      if (adminToken && storedType) {
        setIsAuthenticated(true);
        setAdminType(storedType);
        setAdminName(storedName);
        setAdminId(storedId);
        
        try {
          const parsedPermissions = JSON.parse(storedPermissions || '{}');
          setPermissions(parsedPermissions);
        } catch (error) {
          logger.error('Erro ao processar permissões:', error);
          setPermissions({});
        }

        logger.info('Admin autenticado:', { 
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
        logger.warn('Token de admin não encontrado');
      }
    } catch (error) {
      logger.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenExpiration, permissions]);

  useEffect(() => {
    checkAuth();
    // Verifica a autenticação a cada 15 minutos
    const interval = setInterval(checkAuth, 15 * 60 * 1000);
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
      localStorage.removeItem('adminEmpresa');
      setIsAuthenticated(false);
      setAdminType(null);
      setAdminName(null);
      setAdminId(null);
      setPermissions({});
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      logger.error('Erro durante logout:', error);
      toast.error("Erro ao realizar logout");
    }
  }, []);

  const hasPermission = useCallback((permission) => {
    if (adminType === 'master') {
      return true;
    }
    return permissions[permission] === true;
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