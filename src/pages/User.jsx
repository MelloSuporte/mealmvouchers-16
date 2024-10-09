import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User as UserIcon, CreditCard, Building2, Briefcase } from 'lucide-react';

const User = () => {
  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%]"></div>
      
      <div className="relative z-10 p-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-8">Cadastro do Usuário</h1>
        
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="text-blue-600" />
            <Input placeholder="Usuário" />
          </div>
          
          <div className="flex items-center space-x-2">
            <CreditCard className="text-blue-600" />
            <Input placeholder="CPF" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Building2 className="text-blue-600" />
            <Input placeholder="Entidade" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Briefcase className="text-blue-600" />
            <Input placeholder="Setor" />
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default User;