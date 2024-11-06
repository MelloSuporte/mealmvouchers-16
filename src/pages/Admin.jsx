import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAdmin } from '../contexts/AdminContext';
import UserForm from '../components/admin/UserForm';
import CompanyForm from '../components/admin/CompanyForm';
import MealScheduleManager from '../components/admin/meals/MealScheduleManager';
import RLSForm from '../components/admin/RLSForm';
import BackgroundImageForm from '../components/admin/BackgroundImageForm';
import ReportForm from '../components/admin/ReportForm';
import TurnosForm from '../components/admin/TurnosForm';
import DisposableVoucherForm from '../components/admin/DisposableVoucherForm';
import AdminManagement from './AdminManagement';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const navigate = useNavigate();
  const { isMasterAdmin, adminPermissions } = useAdmin();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success("Logout realizado com sucesso!");
    navigate('/voucher');
  };

  const renderTab = (value, component, requiredPermission = null) => {
    if (!isMasterAdmin && requiredPermission && !adminPermissions[requiredPermission]) {
      return (
        <TabsContent value={value}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                Você não tem permissão para acessar esta funcionalidade
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      );
    }

    return (
      <TabsContent value={value}>
        <Card>
          <CardHeader>
            <CardTitle>{value.charAt(0).toUpperCase() + value.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            {component}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  const renderTrigger = (value, label, requiredPermission = null) => {
    if (!isMasterAdmin && requiredPermission && !adminPermissions[requiredPermission]) {
      return null;
    }
    return <TabsTrigger value={value}>{label}</TabsTrigger>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel de Administração</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-9">
          {renderTrigger("users", "Usuários", "manage_users")}
          {renderTrigger("companies", "Empresas", "manage_companies")}
          {renderTrigger("meals", "Refeições", "manage_meals")}
          {renderTrigger("rls", "Vouchers Extras", "manage_extra_vouchers")}
          {renderTrigger("disposable", "Vouchers Descartáveis", "manage_disposable_vouchers")}
          {renderTrigger("backgrounds", "Imagens de Fundo", "manage_backgrounds")}
          {renderTrigger("reports", "Relatórios", "manage_reports")}
          {renderTrigger("turnos", "Turnos", "manage_turnos")}
          {renderTrigger("managers", "Gerentes", "manage_managers")}
        </TabsList>

        {renderTab("users", <UserForm />, "manage_users")}
        {renderTab("companies", <CompanyForm />, "manage_companies")}
        {renderTab("meals", <MealScheduleManager />, "manage_meals")}
        {renderTab("rls", <RLSForm />, "manage_extra_vouchers")}
        {renderTab("disposable", <DisposableVoucherForm />, "manage_disposable_vouchers")}
        {renderTab("backgrounds", <BackgroundImageForm />, "manage_backgrounds")}
        {renderTab("reports", <ReportForm />, "manage_reports")}
        {renderTab("turnos", <TurnosForm />, "manage_turnos")}
        {renderTab("managers", <AdminManagement />, "manage_managers")}
      </Tabs>
    </div>
  );
};

export default Admin;