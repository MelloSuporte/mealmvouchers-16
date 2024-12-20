import React from 'react';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from 'date-fns';

const LogsSection = () => {
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    tipo: '',
    nivel: ''
  });

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: async () => {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      if (!response.ok) throw new Error('Erro ao buscar logs');
      return response.json();
    }
  });

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar logs: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Data Início"
          className="w-auto"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Data Fim"
          className="w-auto"
        />
        <Input
          value={filters.tipo}
          onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
          placeholder="Tipo"
          className="w-auto"
        />
        <Input
          value={filters.nivel}
          onChange={(e) => setFilters({ ...filters, nivel: e.target.value })}
          placeholder="Nível"
          className="w-auto"
        />
        <Button
          variant="outline"
          onClick={() => setFilters({ startDate: '', endDate: '', tipo: '', nivel: '' })}
        >
          Limpar Filtros
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.criado_em)}</TableCell>
                <TableCell>{log.tipo}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.nivel === 'error' ? 'bg-red-100 text-red-800' :
                    log.nivel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.nivel}
                  </span>
                </TableCell>
                <TableCell>{log.mensagem}</TableCell>
                <TableCell>
                  <pre className="text-xs whitespace-pre-wrap max-w-xs">
                    {JSON.stringify(log.detalhes, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogsSection;