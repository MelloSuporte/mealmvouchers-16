import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../../utils/api';

const UsageTable = ({ searchTerm }) => {
  const { data: usageData = [] } = useQuery({
    queryKey: ['usage-data', searchTerm],
    queryFn: async () => {
      const response = await api.get('/reports/usage?search=' + encodeURIComponent(searchTerm));
      return response.data || [];
    }
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Voucher</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Refeição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Turno</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usageData.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{formatDateTime(item.usado_em)}</TableCell>
            <TableCell>{item.nome_usuario}</TableCell>
            <TableCell>{item.cpf}</TableCell>
            <TableCell>{item.voucher}</TableCell>
            <TableCell>{item.empresa}</TableCell>
            <TableCell>{item.tipo_refeicao}</TableCell>
            <TableCell>R$ {Number(item.valor_refeicao).toFixed(2)}</TableCell>
            <TableCell>{item.turno}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsageTable;