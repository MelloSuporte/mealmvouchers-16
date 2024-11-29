import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../../config/supabase';

const UsageTable = ({ searchTerm }) => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ['usage-data', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .order('usado_em', { ascending: false });
      
      if (searchTerm) {
        query = query.ilike('nome_usuario', `%${searchTerm}%`);
      }

      const { data, error } = await query;
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

  // Garante que sempre temos um array válido para o map
  const safeUsageData = Array.isArray(usageData) ? usageData : [];

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8} className="text-center">Carregando dados...</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }

  if (error) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={8} className="text-center text-red-500">
              Erro ao carregar dados. Por favor, tente novamente.
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }

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
        {safeUsageData.map((item) => (
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