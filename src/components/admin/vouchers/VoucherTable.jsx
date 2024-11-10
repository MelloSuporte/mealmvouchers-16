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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const VoucherTable = ({ vouchers = [] }) => {
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Vouchers Descartáveis', 14, 15);
      
      const tableData = vouchers.map(voucher => [
        voucher.codigo,
        voucher.tipo_refeicao_nome || 'Não especificado',
        format(new Date(voucher.data_criacao), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        voucher.data_uso ? format(new Date(voucher.data_uso), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-',
        format(new Date(voucher.data_expiracao), "dd/MM/yyyy HH:mm", { locale: ptBR }),
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

  const voucherArray = Array.isArray(vouchers) ? vouchers : [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-bold">Vouchers Descartáveis</Label>
          {voucherArray.length > 0 && (
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
              {voucherArray.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.codigo}</TableCell>
                  <TableCell>{voucher.tipo_refeicao_nome || 'Não especificado'}</TableCell>
                  <TableCell>
                    {format(new Date(voucher.data_criacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {voucher.data_uso 
                      ? format(new Date(voucher.data_uso), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(voucher.data_expiracao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
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