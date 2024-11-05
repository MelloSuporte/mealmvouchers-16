import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminForm from './AdminForm';
import AdminTable from './AdminTable';
import api from '../../../utils/api';

const AdminList = () => {
  const [searchCPF, setSearchCPF] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins', searchCPF],
    queryFn: async () => {
      const response = await api.get('/api/admin-users', {
        params: { cpf: searchCPF }
      });
      return response.data;
    }
  });

  const handleSearch = () => {
    if (!searchCPF) {
      toast.error('Informe um CPF para buscar');
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="CPF do Gestor"
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value)}
        />
        <Button onClick={handleSearch}>Buscar</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Novo Gestor
        </Button>
      </div>

      {showForm && (
        <AdminForm onClose={() => setShowForm(false)} />
      )}

      <AdminTable admins={admins || []} isLoading={isLoading} />
    </div>
  );
};

export default AdminList;