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
      <Card className="p-6">
        <AdminList />
      </Card>
    </div>
  );
};

export default AdminManagement;