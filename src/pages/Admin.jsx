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

const Admin = () => {
  const { user, logout, hasPermission } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/voucher');
  };

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

  const authorizedTabs = tabs.filter(tab => hasPermission(tab.permission));
  const defaultTab = authorizedTabs[0]?.id || '';

  return (
    <AdminProvider>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Administração</h1>
          <div className="flex items-center gap-2">
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
      </div>
      {user ? null : <AdminLoginDialog />}
    </AdminProvider>
  );
};

export default Admin;