import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");

  const renderUserForm = () => (
    <form className="space-y-4">
      <Input placeholder="Nome do usuário" />
      <Input placeholder="Email" type="email" />
      <Input placeholder="Senha" type="password" />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Cadastrar Usuário</Button>
    </form>
  );

  const renderCompanyForm = () => (
    <form className="space-y-4">
      <Input placeholder="Nome da empresa" />
      <Input placeholder="CNPJ" />
      <Button type="submit">Cadastrar Empresa</Button>
    </form>
  );

  const renderMealTypeForm = () => (
    <form className="space-y-4">
      <Input placeholder="Tipo de refeição" />
      <Input placeholder="Valor" type="number" step="0.01" />
      <Button type="submit">Cadastrar Tipo de Refeição</Button>
    </form>
  );

  const renderRLSForm = () => (
    <form className="space-y-4">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Usuário" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user1">Usuário 1</SelectItem>
          <SelectItem value="user2">Usuário 2</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Definir RLS</Button>
    </form>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Administração</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="mealTypes">Tipos de Refeições</TabsTrigger>
          <TabsTrigger value="rls">RLS</TabsTrigger>
        </TabsList>
        <TabsContent value="users">{renderUserForm()}</TabsContent>
        <TabsContent value="companies">{renderCompanyForm()}</TabsContent>
        <TabsContent value="mealTypes">{renderMealTypeForm()}</TabsContent>
        <TabsContent value="rls">{renderRLSForm()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;