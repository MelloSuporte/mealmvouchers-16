import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import AdminForm from './AdminForm';
import AdminTable from './AdminTable';
import api from '../../../utils/api';

const AdminList = () => {
  const [searchCPF, setSearchCPF] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins', searchCPF, selectedCompany],
    queryFn: async () => {
      const response = await api.get('/api/admin-users', {
        params: { cpf: searchCPF, company_id: selectedCompany }
      });
      return response.data;
    }
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/api/companies');
      return response.data;
    }
  });

  const handleSearch = () => {
    if (!searchCPF && !selectedCompany) {
      toast.error('Informe pelo menos um filtro de busca');
      return;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="CPF do Gestor"
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Todas as Empresas</option>
          {companies?.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <Button onClick={handleSearch}>Buscar</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Novo Gestor
        </Button>
      </div>

      {showForm && (
        <AdminForm onClose={() => setShowForm(false)} />
      )}

      <AdminTable admins={admins || []} isLoading={isLoading} />
    </Card>
  );
};

export default AdminList;