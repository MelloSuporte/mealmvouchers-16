import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/config/supabase';

const UsageTable = ({ searchTerm }) => {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ['usage-data', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('relatorio_uso_voucher')
        .select(`
          id,
          data_uso,
          nome_usuario,
          cpf,
          nome_empresa,
          turno,
          nome_setor,
          tipo_refeicao,
          valor,
          codigo_voucher,
          tipo_voucher,
          valor_refeicao,
          observacao
        `)
        .order('data_uso', { ascending: false });
      
      if (searchTerm) {
        query = query.ilike('nome_usuario', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
      }
      console.log('Dados recuperados:', data?.length || 0, 'registros');
      return data || [];
    }
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={9} className="text-center">Carregando dados...</TableHead>
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
            <TableHead colSpan={9} className="text-center text-red-500">
              Erro ao carregar dados: {error.message}
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }

  const safeUsageData = Array.isArray(usageData) ? usageData : [];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Refeição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeUsageData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4">
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          ) : (
            safeUsageData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.data_uso)}</TableCell>
                <TableCell>{item.codigo_voucher || '-'}</TableCell>
                <TableCell>{item.tipo_voucher || '-'}</TableCell>
                <TableCell>{item.nome_usuario}</TableCell>
                <TableCell>{item.cpf}</TableCell>
                <TableCell>{item.nome_empresa}</TableCell>
                <TableCell>{item.turno}</TableCell>
                <TableCell>{item.nome_setor}</TableCell>
                <TableCell>{item.tipo_refeicao}</TableCell>
                <TableCell>{formatCurrency(item.valor || item.valor_refeicao)}</TableCell>
                <TableCell>{item.observacao || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsageTable;