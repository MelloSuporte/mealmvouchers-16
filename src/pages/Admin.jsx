import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserForm from '../components/admin/UserForm';
import CompanyForm from '../components/admin/CompanyForm';
import MealTypeForm from '../components/admin/MealTypeForm';
import RLSForm from '../components/admin/RLSForm';
import BackgroundImageForm from '../components/admin/BackgroundImageForm';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Administração</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="mealTypes">Tipos de Refeições</TabsTrigger>
          <TabsTrigger value="rls">RLS</TabsTrigger>
          <TabsTrigger value="backgrounds">Imagens de Fundo</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Admin;