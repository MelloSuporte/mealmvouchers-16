import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from '../../../utils/api';

const UsageTable = ({ searchTerm }) => {
  const { data: usageData = [] } = useQuery({
    queryKey: ['usage-data', searchTerm],
    queryFn: async () => {
      const response = await api.get(`/reports/usage?search=${searchTerm}`);
      return response.data || [];
    }
  });

  // Garante que usageData seja sempre um array
  const dataArray = Array.isArray(usageData) ? usageData : [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Refeição</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Custo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataArray.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.time}</TableCell>
            <TableCell>{item.userName}</TableCell>
            <TableCell>{item.company}</TableCell>
            <TableCell>{item.mealType}</TableCell>
            <TableCell>{item.voucherType}</TableCell>
            <TableCell>R$ {item.cost.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsageTable;