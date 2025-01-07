import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExtraMealForm from '../components/admin/extra-meals/ExtraMealForm';
import ExtraMealReport from '../components/admin/extra-meals/ExtraMealReport';

const RefeicoesExtras = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Refeições Extras</h1>
      
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
          <TabsTrigger value="report">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <ExtraMealForm />
        </TabsContent>
        
        <TabsContent value="report">
          <ExtraMealReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefeicoesExtras;