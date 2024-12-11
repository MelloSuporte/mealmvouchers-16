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
  const activeVouchers = vouchers.filter(v => !v.usado);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-';
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(14);
      doc.text('Vouchers Descartáveis Ativos', 14, 15);
      
      const tableData = activeVouchers.map(voucher => [
        voucher.codigo,
        voucher.tipos_refeicao?.nome || 'Não especificado',
        formatDate(voucher.data_criacao),
        formatDate(voucher.data_expiracao)
      ]);

      autoTable(doc, {
        head: [['Código', 'Tipo Refeição', 'Data Criação', 'Data Expiração']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save('vouchers-descartaveis-ativos.pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-sm font-medium text-gray-700">Vouchers Descartáveis Ativos</Label>
          {activeVouchers.length > 0 && (
            <Button onClick={downloadPDF} variant="outline" size="sm" className="h-8 text-xs">
              <Download className="mr-2 h-3 w-3" />
              Baixar PDF
            </Button>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium">Código</TableHead>
                <TableHead className="text-xs font-medium">Tipo Refeição</TableHead>
                <TableHead className="text-xs font-medium">Data Criação</TableHead>
                <TableHead className="text-xs font-medium">Data Expiração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-gray-50">
                  <TableCell className="text-xs">{voucher.codigo}</TableCell>
                  <TableCell className="text-xs">{voucher.tipos_refeicao?.nome || 'Não especificado'}</TableCell>
                  <TableCell className="text-xs">{formatDate(voucher.data_criacao)}</TableCell>
                  <TableCell className="text-xs">{formatDate(voucher.data_expiracao)}</TableCell>
                </TableRow>
              ))}
              {activeVouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-gray-500 py-4">
                    Nenhum voucher ativo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoucherTable;