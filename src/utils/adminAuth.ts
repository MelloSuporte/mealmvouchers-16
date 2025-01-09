import logger from '../config/logger';
import { AdminPermissions } from '../types/admin';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

export const checkTokenExpiration = (): boolean => {
  const adminType = localStorage.getItem('adminType');
  
  // Admin master nunca expira
  if (adminType === 'master') {
    return true;
  }

  const lastLoginTime = localStorage.getItem('adminLoginTime');
  if (!lastLoginTime) {
    logger.warn('Tempo de login não encontrado');
    return false;
  }

  const loginTime = Number(lastLoginTime);
  const currentTime = Date.now();
  const timeElapsed = currentTime - loginTime;
  
  // Se passou mais de 7 dias, sessão expirou
  const isExpired = timeElapsed > SEVEN_DAYS;

  logger.info('Verificação de expiração:', {
    loginTime: new Date(loginTime).toISOString(),
    currentTime: new Date(currentTime).toISOString(),
    timeElapsed: Math.floor(timeElapsed / (1000 * 60 * 60)), // horas
    isExpired
  });

  return !isExpired;
};

export const parseStoredPermissions = (storedPermissions: string | null): AdminPermissions => {
  try {
    if (!storedPermissions) {
      return {};
    }
    return JSON.parse(storedPermissions);
  } catch (error) {
    logger.error('Erro ao processar permissões:', error);
    return {};
  }
};

export const clearAdminSession = () => {
  const adminType = localStorage.getItem('adminType');
  
  // Não limpa sessão de admin master
  if (adminType === 'master') {
    logger.info('Tentativa de limpar sessão de admin master ignorada');
    return;
  }

  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminType');
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminPermissions');
  localStorage.removeItem('adminLoginTime');
  localStorage.removeItem('adminEmpresa');
  
  logger.info('Sessão de admin limpa com sucesso');
};