import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VoucherTable = ({ vouchers }) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.text('Vouchers Descartáveis Ativos', 14, 15);

    const tableData = vouchers.map(voucher => [
      voucher.codigo,
      voucher.tipos_refeicao?.nome || '',
      voucher.nome_pessoa || '-',
      voucher.nome_empresa || '-',
      format(new Date(voucher.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      voucher.data_uso ? format(new Date(voucher.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      voucher.solicitante || '-'
    ]);

    doc.autoTable({
      head: [['Código', 'Tipo de Refeição', 'Nome', 'Empresa', 'Data Requisição', 'Data Uso', 'Solicitante']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 20 },
      didDrawPage: function (data) {
        doc.text('Página ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('vouchers-descartaveis.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Vouchers Descartáveis Ativos</h2>
        {vouchers && vouchers.length > 0 && (
          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Exportar PDF
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo de Refeição</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Data Requisição</TableHead>
              <TableHead>Data Uso</TableHead>
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
                  <TableCell>{voucher.nome_pessoa || '-'}</TableCell>
                  <TableCell>{voucher.nome_empresa || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(voucher.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {voucher.data_uso ? format(new Date(voucher.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>{voucher.solicitante || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VoucherTable;