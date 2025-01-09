import logger from '../config/logger';
import { AdminPermissions } from '../types/admin';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const checkTokenExpiration = (): boolean => {
  const tokenData = localStorage.getItem('adminToken');
  const adminType = localStorage.getItem('adminType');
  
  if (!tokenData) {
    logger.warn('Token não encontrado');
    return false;
  }

  if (adminType === 'master') {
    logger.info('Admin master - sessão permanente');
    return true;
  }

  const lastLoginTime = localStorage.getItem('adminLoginTime');
  if (!lastLoginTime) {
    logger.warn('Tempo de login não encontrado');
    return false;
  }

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
      tempoRestante: Math.floor((expirationTime - new Date()) / (1000 * 60 * 60)),
      adminType
    });
  }

  return !isExpired;
};

export const parseStoredPermissions = (storedPermissions: string | null): AdminPermissions => {
  try {
    return JSON.parse(storedPermissions || '{}');
  } catch (error) {
    logger.error('Erro ao processar permissões:', error);
    return {};
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminType');
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminPermissions');
  localStorage.removeItem('adminLoginTime');
  localStorage.removeItem('adminEmpresa');
};