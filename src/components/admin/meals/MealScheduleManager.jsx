import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MealScheduleForm from './MealScheduleForm';
import MealScheduleList from './MealScheduleList';

const MealScheduleManager = () => {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Lista</TabsTrigger>
        <TabsTrigger value="new">Nova</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Refeições</CardTitle>
          </CardHeader>
          <CardContent>
            <MealScheduleList />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="new">
        <Card>
          <CardHeader>
            <CardTitle>Refeição</CardTitle>
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