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
import AdminManagement from '../pages/AdminManagement';

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
          {renderTrigger("users", "Usuário", "manage_users")}
          {isMasterAdmin && <TabsTrigger value="companies">Empresas</TabsTrigger>}
          {isMasterAdmin && <TabsTrigger value="meals">Refeições</TabsTrigger>}
          {renderTrigger("rls", "Vouchers Extras", "manage_extra_vouchers")}
          {renderTrigger("disposable", "Vouchers Descartáveis", "manage_disposable_vouchers")}
          {isMasterAdmin && <TabsTrigger value="backgrounds">Imagens de Fundo</TabsTrigger>}
          {renderTrigger("reports", "Relatórios", "manage_reports")}
          {isMasterAdmin && <TabsTrigger value="turnos"></TabsTrigger>}
          {isMasterAdmin && <TabsTrigger value="managers">Gerentes</TabsTrigger>}
        </TabsList>

        {renderTab("users", <UserForm />, "manage_users")}
        {isMasterAdmin && renderTab("companies", <CompanyForm />)}
        {isMasterAdmin && renderTab("meals", <MealScheduleManager />)}
        {renderTab("rls", <RLSForm />, "manage_extra_vouchers")}
        {renderTab("disposable", <DisposableVoucherForm />, "manage_disposable_vouchers")}
        {isMasterAdmin && renderTab("backgrounds", <BackgroundImageForm />)}
        {renderTab("reports", <ReportForm />, "manage_reports")}
        {isMasterAdmin && renderTab("turnos", <TurnosForm />)}
        {isMasterAdmin && renderTab("managers", <AdminManagement />)}
      </Tabs>
    </div>
  );
};

export default Admin;