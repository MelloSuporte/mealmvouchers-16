import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const User = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [company, setCompany] = useState("");
  const [voucherPassword, setVoucherPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExtraMeal, setIsExtraMeal] = useState(false);

  // Mock data for companies
  const companies = ["Empresa A", "Empresa B", "Empresa C"];

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica de salvar
    console.log('Salvando usuário:', { fullName, cpf, company, voucherPassword, isExtraMeal });
    setIsRegistering(false);
    setIsChangingPassword(false);
  };

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      setCpf(value);
      if (!isChangingPassword && value.length >= 4) {
        setVoucherPassword(value.substring(0, 4));
      }
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!isRegistering && (
            <>
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">Usuário</h2>
              <Button onClick={handleRegister} className="w-full">Cadastrar Usuário</Button>
            </>
          )}
          {isRegistering && (
            <form className="w-full space-y-4">
              <Input
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                placeholder="CPF (000.000.000-00)"
                value={cpf}
                onChange={handleCPFChange}
              />
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((comp) => (
                    <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="password"
                placeholder="Senha do Voucher (4 dígitos)"
                value={voucherPassword}
                onChange={(e) => setVoucherPassword(e.target.value.slice(0, 4))}
                maxLength={4}
                disabled={!isChangingPassword}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraMeal"
                  checked={isExtraMeal}
                  onCheckedChange={setIsExtraMeal}
                />
                <label
                  htmlFor="extraMeal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Refeição Extra
                </label>
              </div>
              <Button onClick={handleChangePassword} className="w-full">
                {isChangingPassword ? "Cancelar Alteração de Senha" : "Alterar Senha"}
              </Button>
              <Button onClick={handleSave} className="w-full">Salvar Cadastro</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default User;