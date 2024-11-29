import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../../config/supabase';

const UsageTable = ({ searchTerm }) => {
  const { data: usageData = [] } = useQuery({
    queryKey: ['usage-data', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .ilike('nome_usuario', `%${searchTerm}%`)
        .order('usado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <TableCell>{formatCurrency(item.valor_refeicao)}</TableCell>
            <TableCell>{item.turno}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsageTable;