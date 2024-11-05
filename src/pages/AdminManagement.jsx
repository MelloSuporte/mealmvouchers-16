import React from 'react';
import { Card } from "@/components/ui/card";
import AdminList from '../components/admin/managers/AdminList';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminManagement = () => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Gerentes</h1>
      <Card className="p-6">
        <AdminList />
      </Card>
    </div>
  );
};

export default AdminManagement;