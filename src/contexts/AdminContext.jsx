import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

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
  const [isInitialized, setIsInitialized] = useState(false);
  
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

  // Função para verificar a integridade das permissões
  const verifyPermissionsIntegrity = (permissions) => {
    const requiredPermissions = Object.keys(DEFAULT_ADMIN_PERMISSIONS);
    const hasAllPermissions = requiredPermissions.every(key => key in permissions);
    
    if (!hasAllPermissions) {
      console.error('ALERTA DE SEGURANÇA: Permissões incompletas detectadas');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const initializeAdminContext = () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const adminType = localStorage.getItem('adminType');
        const storedPermissions = localStorage.getItem('adminPermissions');

        if (adminToken === 'master-admin-token' || adminType === 'master') {
          // Verificação de segurança para admin master
          const masterPermissions = { ...DEFAULT_ADMIN_PERMISSIONS };
          
          if (!verifyPermissionsIntegrity(masterPermissions)) {
            toast.error("Erro crítico de segurança: Permissões do admin master comprometidas");
            localStorage.clear();
            window.location.reload();
            return;
          }

          setIsMasterAdmin(true);
          setAdminPermissions(masterPermissions);
          localStorage.setItem('adminPermissions', JSON.stringify(masterPermissions));
        } else if (adminToken && storedPermissions) {
          try {
            const parsedPermissions = JSON.parse(storedPermissions);
            
            if (!verifyPermissionsIntegrity(parsedPermissions)) {
              toast.error("Erro de segurança: Permissões inválidas detectadas");
              localStorage.clear();
              window.location.reload();
              return;
            }

            setAdminPermissions(parsedPermissions);
          } catch (error) {
            console.error('Erro ao processar permissões:', error);
            toast.error("Erro ao processar permissões do administrador");
            localStorage.clear();
            window.location.reload();
            return;
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Erro crítico ao inicializar contexto:', error);
        toast.error("Erro crítico ao inicializar sistema administrativo");
        localStorage.clear();
        window.location.reload();
      }
    };

    initializeAdminContext();
  }, []);

  const value = React.useMemo(() => ({
    isMasterAdmin,
    adminPermissions,
    isInitialized,
    verifyPermissionsIntegrity
  }), [isMasterAdmin, adminPermissions, isInitialized]);

  if (!isInitialized) {
    return <div>Inicializando sistema administrativo...</div>;
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;