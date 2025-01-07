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
import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import RefeicoesExtras from './RefeicoesExtras';
import MealRegistrationForm from '@/components/admin/meals/MealRegistrationForm';

const Admin = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/voucher');
  };

  return (
    <AdminProvider>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Administração</h1>
          <div className="flex items-center gap-2">
            <MealRegistrationForm />
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
        
        <Tabs defaultValue="users" className="mt-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="meal-types">Tipos de Refeição</TabsTrigger>
            <TabsTrigger value="reports-t">Relatórios (T)</TabsTrigger>
            <TabsTrigger value="rls">Vouchers Extras</TabsTrigger>
            <TabsTrigger value="disposable-vouchers">Vouchers Descartáveis</TabsTrigger>
            <TabsTrigger value="background-images">Imagens de Fundo</TabsTrigger>
            <TabsTrigger value="managers">Gerentes</TabsTrigger>
            <TabsTrigger value="turnos">Turnos</TabsTrigger>
            <TabsTrigger value="refeicoes-extras">Refeições Extras</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <UserFormMain />
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CompanyForm />
            </Card>
          </TabsContent>

          <TabsContent value="meal-types">
            <Card>
              <MealTypeForm />
            </Card>
          </TabsContent>

          <TabsContent value="reports-t">
            <Card>
              <ReportsTForm />
            </Card>
          </TabsContent>

          <TabsContent value="rls">
            <Card>
              <RLSForm />
            </Card>
          </TabsContent>

          <TabsContent value="disposable-vouchers">
            <Card>
              <DisposableVoucherForm />
            </Card>
          </TabsContent>

          <TabsContent value="background-images">
            <Card>
              <BackgroundImageForm />
            </Card>
          </TabsContent>

          <TabsContent value="managers">
            <Card>
              <AdminList />
            </Card>
          </TabsContent>

          <TabsContent value="turnos">
            <Card>
              <TurnosForm />
            </Card>
          </TabsContent>

          <TabsContent value="refeicoes-extras">
            <Card>
              <RefeicoesExtras />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {user ? null : <AdminLoginDialog />}
    </AdminProvider>
  );
};

export default Admin;