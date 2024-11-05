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

const VoucherTable = ({ vouchers }) => {
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Adiciona título
      doc.setFontSize(16);
      doc.text('Vouchers Descartáveis', 14, 15);
      
      // Prepara dados para a tabela
      const tableData = vouchers.map(voucher => [
        voucher.code,
        voucher.meal_type_name,
        new Date(voucher.expired_at).toLocaleDateString(),
        voucher.is_used ? 'Utilizado' : 'Disponível'
      ]);

      // Gera a tabela
      autoTable(doc, {
        head: [['Código', 'Tipo de Refeição', 'Data de Expiração', 'Status']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Download do arquivo
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
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo de Refeição</TableHead>
                <TableHead>Data de Expiração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher, index) => (
                <TableRow key={index}>
                  <TableCell>{voucher.code}</TableCell>
                  <TableCell>{voucher.meal_type_name}</TableCell>
                  <TableCell>
                    {new Date(voucher.expired_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {voucher.is_used ? 'Utilizado' : 'Disponível'}
                  </TableCell>
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