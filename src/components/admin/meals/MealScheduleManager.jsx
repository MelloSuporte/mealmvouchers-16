import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealScheduleForm from './MealScheduleForm';
import MealScheduleList from './MealScheduleList';

const MealScheduleManager = () => {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Lista de Refeições</TabsTrigger>
        <TabsTrigger value="new">Nova Refeição</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Refeições Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <MealScheduleList />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="new">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Refeição</CardTitle>
          </CardHeader>
          <CardContent>
            <MealScheduleForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MealScheduleManager;