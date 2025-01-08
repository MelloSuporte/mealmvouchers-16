import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import UserFormMain from '@/components/admin/UserFormMain';
import CompanyForm from '@/components/admin/CompanyForm';
import MealTypeForm from '@/components/admin/meal-type/MealTypeForm';
import ReportsTForm from '@/components/admin/reports-t/ReportsTForm';
import RLSForm from '@/components/admin/RLSForm';
import DisposableVoucherForm from '@/components/admin/DisposableVoucherForm';
import BackgroundImageForm from '@/components/admin/BackgroundImageForm';
import AdminLoginDialog from '@/components/AdminLoginDialog';
import AdminList from '@/components/admin/managers/AdminList';
import TurnosForm from '@/components/admin/TurnosForm';
import { LogOut, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import RefeicoesExtras from './RefeicoesExtras';
import logger from '../config/logger';

const Admin = () => {
  const { isAuthenticated, logout, hasPermission, isMasterAdmin, adminType, adminName } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/voucher');
  };

  // Debug logs
  logger.info('Admin Component State:', {
    isAuthenticated,
    isMasterAdmin,
    adminType,
    adminName,
    hasPermissionGerenciarUsuarios: hasPermission('gerenciar_usuarios'),
    hasPermissionGerenciarEmpresas: hasPermission('gerenciar_empresas'),
    hasPermissionGerenciarTiposRefeicao: hasPermission('gerenciar_tipos_refeicao'),
    hasPermissionGerenciarRelatorios: hasPermission('gerenciar_relatorios'),
    hasPermissionGerenciarVouchersExtra: hasPermission('gerenciar_vouchers_extra'),
    hasPermissionGerenciarVouchersDescartaveis: hasPermission('gerenciar_vouchers_descartaveis'),
    hasPermissionGerenciarImagensFundo: hasPermission('gerenciar_imagens_fundo'),
    hasPermissionGerenciarGerentes: hasPermission('gerenciar_gerentes'),
    hasPermissionGerenciarTurnos: hasPermission('gerenciar_turnos'),
    hasPermissionGerenciarRefeicoesExtras: hasPermission('gerenciar_refeicoes_extras')
  });

  const tabs = [
    {
      id: 'users',
      label: 'Usuários',
      content: <UserFormMain />,
      permission: 'gerenciar_usuarios'
    },
    {
      id: 'companies',
      label: 'Empresas',
      content: <CompanyForm />,
      permission: 'gerenciar_empresas'
    },
    {
      id: 'meal-types',
      label: 'Tipos de Refeição',
      content: <MealTypeForm />,
      permission: 'gerenciar_tipos_refeicao'
    },
    {
      id: 'reports-t',
      label: 'Relatórios',
      content: <ReportsTForm />,
      permission: 'gerenciar_relatorios'
    },
    {
      id: 'rls',
      label: 'Vouchers Extras',
      content: <RLSForm />,
      permission: 'gerenciar_vouchers_extra'
    },
    {
      id: 'disposable-vouchers',
      label: 'Vouchers Descartáveis',
      content: <DisposableVoucherForm />,
      permission: 'gerenciar_vouchers_descartaveis'
    },
    {
      id: 'background-images',
      label: 'Imagens de Fundo',
      content: <BackgroundImageForm />,
      permission: 'gerenciar_imagens_fundo'
    },
    {
      id: 'managers',
      label: 'Gerentes',
      content: <AdminList />,
      permission: 'gerenciar_gerentes'
    },
    {
      id: 'turnos',
      label: 'Turnos',
      content: <TurnosForm />,
      permission: 'gerenciar_turnos'
    },
    {
      id: 'refeicoes-extras',
      label: (
        <div className="flex items-center gap-1">
          <Utensils className="h-4 w-4" />
          Refeições Extras
        </div>
      ),
      content: <RefeicoesExtras />,
      permission: 'gerenciar_refeicoes_extras'
    }
  ];

  // Log all tabs and their permission status
  logger.info('Tabs Permission Status:', tabs.map(tab => ({
    id: tab.id,
    permission: tab.permission,
    isVisible: isMasterAdmin || hasPermission(tab.permission)
  })));

  // Filter tabs based on permissions
  const authorizedTabs = tabs.filter(tab => {
    const isAuthorized = isMasterAdmin || hasPermission(tab.permission);
    logger.info(`Tab ${tab.id} authorization:`, {
      isMasterAdmin,
      hasPermission: hasPermission(tab.permission),
      isAuthorized
    });
    return isAuthorized;
  });

  logger.info('Authorized Tabs:', authorizedTabs.map(tab => tab.id));

  const defaultTab = authorizedTabs[0]?.id || '';

  if (!isAuthenticated) {
    return <AdminLoginDialog isOpen={true} onClose={() => {}} />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administração</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {adminName || 'Administrador'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {authorizedTabs.length > 0 ? (
        <Tabs defaultValue={defaultTab} className="mt-4">
          <TabsList>
            {authorizedTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {authorizedTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                {tab.content}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhuma aba disponível para suas permissões atuais
        </div>
      )}
    </div>
  );
};

export default Admin;