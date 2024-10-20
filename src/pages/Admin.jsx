import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from '../components/admin/UserForm';
import CompanyForm from '../components/admin/CompanyForm';
import MealTypeForm from '../components/admin/MealTypeForm';
import RLSForm from '../components/admin/RLSForm';
import BackgroundImageForm from '../components/admin/BackgroundImageForm';
import ReportForm from '../components/admin/ReportForm';
import TurnosForm from '../components/admin/TurnosForm';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/voucher');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel de Administração</h1>
        <Button onClick={handleReturn} variant="outline">Retornar</Button>
      </div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="mealTypes">Tipos de Refeições</TabsTrigger>
          <TabsTrigger value="rls">RLS</TabsTrigger>
          <TabsTrigger value="backgrounds">Imagens de Fundo</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <UserForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mealTypes">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Tipo de Refeição</CardTitle>
            </CardHeader>
            <CardContent>
              <MealTypeForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>Liberação de Voucher Extra</CardTitle>
            </CardHeader>
            <CardContent>
              <RLSForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="backgrounds">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Imagens de Fundo</CardTitle>
            </CardHeader>
            <CardContent>
              <BackgroundImageForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="turnos">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <TurnosForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;