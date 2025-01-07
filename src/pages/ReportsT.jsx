import React from 'react';
import { Card } from "@/components/ui/card";
import ReportsTForm from '@/components/admin/reports-t/ReportsTForm';
import { AdminProvider } from '@/contexts/AdminContext';

const ReportsT = () => {
  return (
    <AdminProvider>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
        <Card>
          <ReportsTForm />
        </Card>
      </div>
    </AdminProvider>
  );
};

export default ReportsT;