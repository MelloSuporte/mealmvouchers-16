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
      
      doc.setFontSize(16);
      doc.text('Vouchers Descartáveis', 14, 15);
      
      const tableData = vouchers.map(voucher => [
        voucher.id,
        voucher.code,
        voucher.user_id || 'NULL',
        voucher.meal_type_id,
        voucher.created_by || 'NULL',
        new Date(voucher.created_at).toLocaleString(),
        voucher.used_at ? new Date(voucher.used_at).toLocaleString() : 'NULL',
        new Date(voucher.expired_at).toLocaleString(),
        voucher.is_used ? '1' : '0'
      ]);

      autoTable(doc, {
        head: [['ID', 'Código', 'User ID', 'Meal Type ID', 'Created By', 'Created At', 'Used At', 'Expired At', 'Is Used']],
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
                <TableHead>ID</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Meal Type ID</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Used At</TableHead>
                <TableHead>Expired At</TableHead>
                <TableHead>Is Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.id}</TableCell>
                  <TableCell>{voucher.code}</TableCell>
                  <TableCell>{voucher.user_id || 'NULL'}</TableCell>
                  <TableCell>{voucher.meal_type_id}</TableCell>
                  <TableCell>{voucher.created_by || 'NULL'}</TableCell>
                  <TableCell>{new Date(voucher.created_at).toLocaleString()}</TableCell>
                  <TableCell>{voucher.used_at ? new Date(voucher.used_at).toLocaleString() : 'NULL'}</TableCell>
                  <TableCell>{new Date(voucher.expired_at).toLocaleString()}</TableCell>
                  <TableCell>{voucher.is_used ? '1' : '0'}</TableCell>
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