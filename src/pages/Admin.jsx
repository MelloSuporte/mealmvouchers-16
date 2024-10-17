import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from 'lucide-react';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [mealType, setMealType] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [userName, setUserName] = useState("");
  const [userCPF, setUserCPF] = useState("");
  const [voucher, setVoucher] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);

  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      setCnpj(value);
    }
  };

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      setUserCPF(value);
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

  const handleSaveMealType = () => {
    console.log('Salvando tipo de refeição:', { mealType, mealValue });
    // Aqui você implementaria a lógica para salvar os dados do tipo de refeição
    setMealType("");
    setMealValue("");
  };

  const generateVoucher = () => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = '';
    for (let i = 0; i < 4; i++) {
      const index = Math.floor(Math.random() * digits.length);
      result += digits[index];
      digits.splice(index, 1);
    }
    return result;
  };

  const handleSaveUser = () => {
    const newVoucher = generateVoucher();
    setVoucher(newVoucher);
    console.log('Salvando usuário:', { userName, userCPF, voucher: newVoucher });
    // Aqui você implementaria a lógica para salvar os dados do usuário
    setUserName("");
    setUserCPF("");
  };

  const toggleVoucherVisibility = () => {
    setShowVoucher(!showVoucher);
  };

  const renderUserForm = () => (
    <form className="space-y-4">
      <Input 
        placeholder="Nome do usuário" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={userCPF}
        onChange={handleCPFChange}
      />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa1">Empresa 1</SelectItem>
          <SelectItem value="empresa2">Empresa 2</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Voucher" 
          value={showVoucher ? voucher : '****'}
          readOnly
        />
        <Button type="button" onClick={toggleVoucherVisibility}>
          {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      </div>
      <Button type="button" onClick={handleSaveUser}>Cadastrar Usuário</Button>
    </form>
  );

  const renderMealTypeForm = () => (
    <form className="space-y-4">
      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de refeição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Almoço">Almoço</SelectItem>
          <SelectItem value="Café">Café</SelectItem>
          <SelectItem value="Lanche">Lanche</SelectItem>
          <SelectItem value="Jantar">Jantar</SelectItem>
          <SelectItem value="Ceia">Ceia</SelectItem>
          <SelectItem value="Extra">Extra</SelectItem>
        </SelectContent>
      </Select>
      <Input 
        placeholder="Valor da refeição" 
        type="number" 
        step="0.01" 
        value={mealValue}
        onChange={(e) => setMealValue(e.target.value)}
      />
      <Button type="button" onClick={handleSaveMealType}>Cadastrar Tipo de Refeição</Button>
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
