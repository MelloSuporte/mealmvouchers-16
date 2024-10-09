import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Users, Calendar, ClipboardList } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Gerenciamento de Refeitório</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="mr-2" />
              Cardápio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerencie o cardápio diário</p>
            <Button className="mt-4">Ver Cardápio</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerencie os usuários do refeitório</p>
            <Button className="mt-4">Ver Usuários</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" />
              Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja e gerencie agendamentos</p>
            <Button className="mt-4">Ver Agendamentos</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2" />
              Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Acesse relatórios e estatísticas</p>
            <Button className="mt-4">Ver Relatórios</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;