import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="p-4 space-y-6">
      <Input type="search" placeholder="Search" className="w-full" />
      <Button className="w-full">Entrar</Button>
    </div>
  );
};

export default Home;