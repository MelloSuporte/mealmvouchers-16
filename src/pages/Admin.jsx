import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);

  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      setCnpj(value);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      setLogo(file);
    } else {
      alert("Por favor, selecione uma imagem PNG.");
    }
  };

  const handleSaveCompany = () => {
    console.log('Salvando empresa:', { companyName, cnpj, logo });
    // Aqui você implementaria a lógica para salvar os dados da empresa
  };

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

  const renderCompanyForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input
            placeholder="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            placeholder="CNPJ (99.999.999/9999-99)"
            value={cnpj}
            onChange={handleCNPJChange}
          />
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Logo da Empresa (PNG)
            </label>
            <Input
              id="logo"
              type="file"
              accept=".png"
              onChange={handleLogoChange}
            />
          </div>
          <Button type="button" onClick={handleSaveCompany}>Cadastrar Empresa</Button>
        </form>
      </CardContent>
    </Card>
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
