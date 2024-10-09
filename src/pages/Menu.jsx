import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Menu = () => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Cardápio do dia</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Prato principal</h3>
          <Input type="text" placeholder="Prato principal" className="w-full" />
        </div>
        <div>
          <h3 className="font-semibold">Acompanhamento</h3>
          <Input type="text" placeholder="Acompanhamento" className="w-full" />
        </div>
      </div>
      <Button className="w-full">Salvar</Button>
    </div>
  );
};

export default Menu;