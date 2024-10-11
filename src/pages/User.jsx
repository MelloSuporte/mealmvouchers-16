import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const User = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");

  // Mock data for companies and sectors
  const companies = ["Empresa A", "Empresa B", "Empresa C"];
  const sectors = ["Setor 1", "Setor 2", "Setor 3"];

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleSave = () => {
    // Here you would typically handle the save logic
    console.log('Saving user:', { fullName, cpf, company, sector });
    setIsRegistering(false);
  };

  const handleUpdate = () => {
    // Here you would typically handle the update logic
    console.log('Updating user:', { fullName, cpf, company, sector });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!isRegistering && (
            <>
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">John Doe</h2>
              <p className="text-gray-500">john.doe@example.com</p>
              <Button onClick={handleRegister} className="w-full">Usuários</Button>
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
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
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
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sec) => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSave} className="w-full">Salvar Cadastro</Button>
              <Button onClick={handleUpdate} className="w-full">Alterar Cadastro</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default User;