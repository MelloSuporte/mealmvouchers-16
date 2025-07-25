import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExtraMealForm from '../components/admin/extra-meals/ExtraMealForm';
import ExtraMealReport from '../components/admin/extra-meals/ExtraMealReport';
import MealRegistrationForm from '../components/admin/meals/MealRegistrationForm';

const RefeicoesExtras = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Refeições Extras</h1>
      </div>
      
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
          <TabsTrigger value="meal">Refeição</TabsTrigger>
          <TabsTrigger value="report">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <div className="space-y-6">
            <ExtraMealForm />
          </div>
        </TabsContent>

        <TabsContent value="meal">
          <MealRegistrationForm />
        </TabsContent>
        
        <TabsContent value="report">
          <ExtraMealReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefeicoesExtras;