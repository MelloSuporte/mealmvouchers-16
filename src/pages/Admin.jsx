import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const { isMasterAdmin, isManager } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        navigate('/admin-login');
        return false;
      }
      return true;
    };

    const initializeAdmin = async () => {
      try {
        setIsLoading(true);
        const isAuthenticated = checkAuth();
        if (!isAuthenticated) return;
        
        if (!isMasterAdmin && !isManager) {
          toast.error("Erro ao carregar permissões. Recarregando...");
          window.location.reload();
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar admin:', error);
        toast.error("Erro ao carregar painel administrativo");
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, [navigate, isMasterAdmin, isManager]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminType');
    toast.success("Logout realizado com sucesso!");
    navigate('/voucher');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel de Administração</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="meals">Refeições</TabsTrigger>
          <TabsTrigger value="rls">Vouchers Extras</TabsTrigger>
          <TabsTrigger value="disposable">Vouchers Descartáveis</TabsTrigger>
          <TabsTrigger value="backgrounds">Imagens de Fundo</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="managers">Gerentes</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <UserForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardContent className="pt-6">
              <CompanyForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals">
          <Card>
            <CardContent className="pt-6">
              <MealScheduleManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardContent className="pt-6">
              <RLSForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disposable">
          <Card>
            <CardContent className="pt-6">
              <DisposableVoucherForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds">
          <Card>
            <CardContent className="pt-6">
              <BackgroundImageForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="pt-6">
              <ReportForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnos">
          <Card>
            <CardContent className="pt-6">
              <TurnosForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers">
          <Card>
            <CardContent className="pt-6">
              <AdminManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;