import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from '../../../utils/api';

const AdminLogs = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    adminCPF: '',
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs', filters],
    queryFn: async () => {
      const response = await api.get('/api/admin-logs', { params: filters });
      return response.data;
    }
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <Input
          placeholder="CPF do Gestor"
          value={filters.adminCPF}
          onChange={(e) => setFilters({ ...filters, adminCPF: e.target.value })}
        />
        <Button onClick={() => setFilters({ startDate: '', endDate: '', adminCPF: '' })}>
          Limpar Filtros
        </Button>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.created_at)}</TableCell>
                <TableCell>{log.admin?.name}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell>{log.entity_type}</TableCell>
                <TableCell>
                  <pre className="text-xs">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminLogs;