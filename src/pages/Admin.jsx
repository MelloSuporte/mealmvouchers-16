import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import UserFormMain from '@/components/admin/UserFormMain';
import CompanyForm from '@/components/admin/CompanyForm';
import MealTypeForm from '@/components/admin/meal-type/MealTypeForm';
import ReportForm from '@/components/admin/ReportForm';
import RLSForm from '@/components/admin/RLSForm';
import DisposableVoucherForm from '@/components/admin/DisposableVoucherForm';
import BackgroundImageForm from '@/components/admin/BackgroundImageForm';
import AdminLoginDialog from '@/components/AdminLoginDialog';
import AdminList from '@/components/admin/managers/AdminList';
import TurnosForm from '@/components/admin/TurnosForm';

const Admin = () => {
  const { user } = useAdmin();

  return (
    <AdminProvider>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Administração</h1>
        <Tabs defaultValue="users" className="mt-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="meal-types">Tipos de Refeição</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="rls">RLS</TabsTrigger>
            <TabsTrigger value="disposable-vouchers">Vouchers Descartáveis</TabsTrigger>
            <TabsTrigger value="background-images">Imagens de Fundo</TabsTrigger>
            <TabsTrigger value="managers">Gerentes</TabsTrigger>
            <TabsTrigger value="turnos">Turnos</TabsTrigger>
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
          <TabsContent value="reports">
            <Card>
              <ReportForm />
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
        </Tabs>
      </div>
      {user ? null : <AdminLoginDialog />}
    </AdminProvider>
  );
};

export default Admin;