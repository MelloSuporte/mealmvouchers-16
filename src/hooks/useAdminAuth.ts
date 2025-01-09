import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import logger from '../config/logger';
import { checkTokenExpiration, parseStoredPermissions, clearAdminSession } from '../utils/adminAuth';
import { AdminState, AdminPermissions, AdminType } from '../types/admin';

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminState>({
    adminType: null,
    adminName: null,
    adminId: null,
    isLoading: true,
    isAuthenticated: false,
    permissions: {}
  });

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
      const storedType = localStorage.getItem('adminType') as AdminType;
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
        const parsedPermissions = parseStoredPermissions(storedPermissions);
        
        setState({
          adminType: storedType,
          adminName: storedName,
          adminId: storedId,
          isLoading: false,
          isAuthenticated: true,
          permissions: parsedPermissions
        });

        logger.info('Admin autenticado:', { 
          type: storedType, 
          name: storedName,
          permissions: parsedPermissions 
        });
      } else {
        setState({
          adminType: null,
          adminName: null,
          adminId: null,
          isLoading: false,
          isAuthenticated: false,
          permissions: {}
        });
        logger.warn('Token de admin não encontrado');
      }
    } catch (error) {
      logger.error('Erro ao verificar autenticação:', error);
      setState({
        adminType: null,
        adminName: null,
        adminId: null,
        isLoading: false,
        isAuthenticated: false,
        permissions: {}
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      clearAdminSession();
      setState({
        adminType: null,
        adminName: null,
        adminId: null,
        isLoading: false,
        isAuthenticated: false,
        permissions: {}
      });
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      logger.error('Erro durante logout:', error);
      toast.error("Erro ao realizar logout");
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAuth]);

  const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
    if (state.adminType === 'master') {
      return true;
    }
    return state.permissions[permission] === true;
  }, [state.adminType, state.permissions]);

  return {
    ...state,
    isMasterAdmin: state.adminType === 'master',
    isManager: state.adminType === 'manager' || state.adminType === 'master',
    hasPermission,
    logout,
    checkAuth
  };
};