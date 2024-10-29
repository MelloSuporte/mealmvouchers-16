import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const User = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [company, setCompany] = useState("");
  const [voucherPassword, setVoucherPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExtraMeal, setIsExtraMeal] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState("");

  const companies = [
    { id: 1, name: "Empresa A" },
    { id: 2, name: "Empresa B" },
    { id: 3, name: "Empresa C" }
  ];

  const turnos = [
    { id: "central", label: "Turno Central", horario: "08:00 - 17:00" },
    { id: "primeiro", label: "Primeiro Turno", horario: "06:00 - 14:00" },
    { id: "segundo", label: "Segundo Turno", horario: "14:00 - 22:00" },
    { id: "terceiro", label: "Terceiro Turno", horario: "22:00 - 06:00" }
  ];

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleSave = () => {
    if (!fullName || !cpf || !company || !selectedTurno) {
      toast.error("Por favor, preencha todos os campos obrigatórios!");
      return;
    }
    
    console.log('Salvando usuário:', { 
      fullName, 
      cpf, 
      company, 
      voucherPassword, 
      isExtraMeal,
      turno: selectedTurno 
    });
    
    toast.success("Usuário cadastrado com sucesso!");
    setIsRegistering(false);
    setIsChangingPassword(false);
  };

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      setCpf(value);
      if (!isChangingPassword && value.length >= 4) {
        setVoucherPassword(value.substring(0, 4));
      }
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!isRegistering ? (
            <>
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">Usuário</h2>
              <Button onClick={handleRegister} className="w-full">Cadastrar Usuário</Button>
            </>
          ) : (
            <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCPFChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select onValueChange={setCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((comp) => (
                      <SelectItem key={comp.id} value={comp.name}>
                        {comp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select onValueChange={setSelectedTurno}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={turno.id}>
                        {turno.label} ({turno.horario})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voucherPassword">Senha do Voucher</Label>
                <Input
                  id="voucherPassword"
                  type="password"
                  placeholder="4 dígitos"
                  value={voucherPassword}
                  onChange={(e) => setVoucherPassword(e.target.value.slice(0, 4))}
                  maxLength={4}
                  disabled={!isChangingPassword}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraMeal"
                  checked={isExtraMeal}
                  onCheckedChange={setIsExtraMeal}
                />
                <Label htmlFor="extraMeal">
                  Refeição Extra
                </Label>
              </div>

              <Button onClick={handleChangePassword} className="w-full">
                {isChangingPassword ? "Cancelar Alteração de Senha" : "Alterar Senha"}
              </Button>
              
              <Button onClick={handleSave} className="w-full">
                Salvar Cadastro
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default User;