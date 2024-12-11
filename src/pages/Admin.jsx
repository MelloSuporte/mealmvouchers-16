import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserFormMain from '@/components/admin/UserFormMain';
import CompanyForm from '@/components/admin/CompanyForm';
import MealTypeForm from '@/components/admin/MealTypeForm';
import ReportForm from '@/components/admin/ReportForm';
import RLSForm from '@/components/admin/RLSForm';
import DisposableVoucherForm from '@/components/admin/DisposableVoucherForm';
import BackgroundImageForm from '@/components/admin/BackgroundImageForm';
import TurnosForm from '@/components/admin/TurnosForm';
import AdminList from '@/components/admin/managers/AdminList';

const Admin = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="refeicoes">Refeições</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="rls">Vouchers Extras</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers Descartáveis</TabsTrigger>
          <TabsTrigger value="imagens">Imagens de Fundo</TabsTrigger>
          <TabsTrigger value="gerentes">Gerentes</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <UserFormMain />
        </TabsContent>

        <TabsContent value="empresas" className="space-y-4">
          <CompanyForm />
        </TabsContent>

        <TabsContent value="refeicoes" className="space-y-4">
          <MealTypeForm />
        </TabsContent>

        <TabsContent value="turnos" className="space-y-4">
          <TurnosForm />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <ReportForm />
        </TabsContent>

        <TabsContent value="rls" className="space-y-4">
          <RLSForm />
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <DisposableVoucherForm />
        </TabsContent>

        <TabsContent value="imagens" className="space-y-4">
          <BackgroundImageForm />
        </TabsContent>

        <TabsContent value="gerentes" className="space-y-4">
          <AdminList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;