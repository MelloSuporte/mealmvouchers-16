import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

/**
 * AVISO DE SEGURANÇA - NÃO MODIFICAR
 * 
 * Este contexto contém configurações críticas de segurança para as permissões de admin.
 * As permissões definidas aqui são essenciais para o funcionamento do sistema.
 * 
 * IMPORTANTE:
 * - Não alterar as permissões do admin master
 * - Não remover nenhuma das permissões existentes
 * - Não modificar a lógica de verificação de permissões
 * 
 * Qualquer alteração neste arquivo pode comprometer a segurança do sistema.
 */

export const AdminProvider = ({ children }) => {
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  
  // Objeto imutável com as permissões padrão do admin
  const DEFAULT_ADMIN_PERMISSIONS = Object.freeze({
    manage_extra_vouchers: true,
    manage_disposable_vouchers: true,
    manage_users: true,
    manage_reports: true,
    manage_companies: true,
    manage_meals: true,
    manage_backgrounds: true,
    manage_turnos: true,
    manage_managers: true,
    manage_system: true,
    full_access: true
  });

  const [adminPermissions, setAdminPermissions] = useState(DEFAULT_ADMIN_PERMISSIONS);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');
    const storedPermissions = localStorage.getItem('adminPermissions');

    if (adminToken === 'master-admin-token' || adminType === 'master') {
      setIsMasterAdmin(true);
      // Cria uma cópia das permissões padrão para evitar modificações
      const masterPermissions = { ...DEFAULT_ADMIN_PERMISSIONS };
      
      // Verifica se todas as permissões estão intactas
      const hasAllPermissions = Object.entries(masterPermissions)
        .every(([key, value]) => value === true);
      
      if (!hasAllPermissions) {
        console.error('ALERTA DE SEGURANÇA: Tentativa de modificar permissões do admin master detectada!');
        return;
      }

      setAdminPermissions(masterPermissions);
      localStorage.setItem('adminPermissions', JSON.stringify(masterPermissions));
    } else if (adminToken && storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        
        // Verifica se as permissões são válidas
        const hasValidPermissions = Object.keys(parsedPermissions)
          .every(key => key in DEFAULT_ADMIN_PERMISSIONS);
        
        if (!hasValidPermissions) {
          throw new Error('Permissões inválidas detectadas');
        }

        setAdminPermissions(parsedPermissions);
      } catch (error) {
        console.error('Erro ao processar permissões:', error);
        // Em caso de erro, define permissões padrão limitadas
        const defaultPermissions = {
          manage_extra_vouchers: true,
          manage_disposable_vouchers: true,
          manage_users: true,
          manage_reports: true
        };
        setAdminPermissions(defaultPermissions);
        localStorage.setItem('adminPermissions', JSON.stringify(defaultPermissions));
      }
    }
  }, []);

  // Função protegida para atualizar permissões
  const updateAdminPermissions = (newPermissions) => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    if (!adminToken || (adminType !== 'master' && adminToken !== 'master-admin-token')) {
      console.error('ALERTA DE SEGURANÇA: Tentativa não autorizada de modificar permissões');
      return;
    }

    // Verifica se as novas permissões são válidas
    const hasValidPermissions = Object.keys(newPermissions)
      .every(key => key in DEFAULT_ADMIN_PERMISSIONS);

    if (!hasValidPermissions) {
      console.error('ALERTA DE SEGURANÇA: Tentativa de adicionar permissões inválidas');
      return;
    }

    setAdminPermissions(newPermissions);
  };

  // Função protegida para atualizar status de admin master
  const updateMasterAdminStatus = (status) => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    if (!adminToken || (adminType !== 'master' && adminToken !== 'master-admin-token')) {
      console.error('ALERTA DE SEGURANÇA: Tentativa não autorizada de modificar status de admin master');
      return;
    }

    setIsMasterAdmin(status);
  };

  const value = React.useMemo(() => ({
    isMasterAdmin,
    adminPermissions,
    setAdminPermissions: updateAdminPermissions,
    setIsMasterAdmin: updateMasterAdminStatus
  }), [isMasterAdmin, adminPermissions]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;