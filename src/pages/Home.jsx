import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Users, Utensils } from 'lucide-react';

const Home = () => {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Bem-vindo ao Refeitório</h1>
      <Input type="search" placeholder="Pesquisar" className="w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Utensils className="h-8 w-8 mb-2" />
            <span>Cardápio</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-8 w-8 mb-2" />
            <span>Usuários</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 mb-2" />
            <span>Agendamentos</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Bell className="h-8 w-8 mb-2" />
            <span>Notificações</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;