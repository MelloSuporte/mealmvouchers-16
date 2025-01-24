import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

const VoucherTable = ({ vouchers }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.text('Vouchers Descartáveis Ativos', 14, 15);

    const tableData = vouchers.map(voucher => [
      voucher.codigo,
      voucher.tipos_refeicao?.nome || '',
      format(new Date(voucher.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      voucher.nome_pessoa || '-',
      voucher.nome_empresa || '-',
      format(new Date(voucher.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      voucher.solicitante?.nome || '-'
    ]);

    doc.autoTable({
      head: [['Código', 'Tipo de Refeição', 'Data Criação', 'Nome', 'Empresa', 'Data Requisição', 'Solicitante']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save('vouchers-descartaveis.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vouchers Descartáveis Ativos</h3>
        {vouchers && vouchers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={generatePDF}
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo de Refeição</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Data Requisição</TableHead>
            <TableHead>Solicitante</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!vouchers || vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Nenhum voucher descartável ativo
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell>{voucher.codigo}</TableCell>
                <TableCell>{voucher.tipos_refeicao?.nome}</TableCell>
                <TableCell>
                  {format(new Date(voucher.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>{voucher.nome_pessoa || '-'}</TableCell>
                <TableCell>{voucher.nome_empresa || '-'}</TableCell>
                <TableCell>
                  {format(new Date(voucher.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>{voucher.solicitante?.nome || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VoucherTable;