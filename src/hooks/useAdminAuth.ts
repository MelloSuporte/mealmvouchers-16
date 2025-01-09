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
      // Se for admin master, não verifica expiração
      const adminType = localStorage.getItem('adminType') as AdminType;
      if (adminType === 'master') {
        const storedName = localStorage.getItem('adminName');
        const storedId = localStorage.getItem('adminId');
        const storedPermissions = localStorage.getItem('adminPermissions');
        
        setState({
          adminType: 'master',
          adminName: storedName,
          adminId: storedId,
          isLoading: false,
          isAuthenticated: true,
          permissions: parseStoredPermissions(storedPermissions)
        });
        
        logger.info('Admin master autenticado:', { 
          name: storedName,
          id: storedId
        });
        return;
      }

      // Para outros tipos de admin, verifica expiração
      const isValid = checkTokenExpiration();
      
      if (!isValid) {
        logger.warn('Sessão expirada ou inválida para admin não-master');
        await logout();
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      const storedName = localStorage.getItem('adminName');
      const storedId = localStorage.getItem('adminId');
      const storedPermissions = localStorage.getItem('adminPermissions');
      
      logger.info('Verificando autenticação:', {
        hasToken: !!adminToken,
        adminType,
        storedName,
        storedId,
        temPermissoes: !!storedPermissions
      });

      if (adminToken && adminType) {
        const parsedPermissions = parseStoredPermissions(storedPermissions);
        
        setState({
          adminType,
          adminName: storedName,
          adminId: storedId,
          isLoading: false,
          isAuthenticated: true,
          permissions: parsedPermissions
        });

        logger.info('Admin autenticado:', { 
          type: adminType, 
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
    // Reduz a frequência de verificação para 1 hora
    const interval = setInterval(checkAuth, 60 * 60 * 1000);
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