import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminList from '../components/admin/managers/AdminList';
import AdminLogs from '../components/admin/managers/AdminLogs';

const AdminManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Gestores</h1>
      
      <Tabs defaultValue="managers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="managers">Gestores</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="managers">
          <AdminList />
        </TabsContent>
        
        <TabsContent value="logs">
          <AdminLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManagement;