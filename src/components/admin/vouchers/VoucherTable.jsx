import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "sonner";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const VoucherTable = ({ vouchers = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-';
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Vouchers Descartáveis', 14, 15);
      
      const tableData = vouchers.map(voucher => [
        voucher.codigo,
        voucher.tipos_refeicao?.nome || 'Não especificado',
        formatDate(voucher.data_criacao),
        formatDate(voucher.data_uso),
        formatDate(voucher.data_expiracao),
        voucher.usado ? 'Sim' : 'Não'
      ]);

      autoTable(doc, {
        head: [['Código', 'Tipo Refeição', 'Data Criação', 'Data Uso', 'Data Expiração', 'Usado']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save('vouchers-descartaveis.pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-bold">Vouchers Descartáveis</Label>
          {vouchers.length > 0 && (
            <Button onClick={downloadPDF} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo Refeição</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Data Uso</TableHead>
                <TableHead>Data Expiração</TableHead>
                <TableHead>Usado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.codigo}</TableCell>
                  <TableCell>{voucher.tipos_refeicao?.nome || 'Não especificado'}</TableCell>
                  <TableCell>{formatDate(voucher.data_criacao)}</TableCell>
                  <TableCell>{voucher.data_uso ? formatDate(voucher.data_uso) : '-'}</TableCell>
                  <TableCell>{formatDate(voucher.data_expiracao)}</TableCell>
                  <TableCell>{voucher.usado ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherTable;