import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Perfil do Usuário</h2>
      <div className="space-y-4">
        <Input type="text" placeholder="Nome" className="w-full" />
        <Input type="email" placeholder="Email" className="w-full" />
      </div>
      <Button className="w-full">Salvar</Button>
    </div>
  );
};

export default Profile;