import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

const VoucherTable = ({ vouchers = [] }) => {
  console.log('Vouchers recebidos na tabela:', vouchers);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont("helvetica");
      
      doc.setFontSize(16);
      doc.text("Vouchers Descartáveis", 14, 15);
      
      const tableData = vouchers.map(voucher => [
        voucher.codigo,
        voucher.tipos_refeicao?.nome || '',
        format(new Date(voucher.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        voucher.nome_pessoa || '-',
        voucher.nome_empresa || '-'
      ]);

      doc.autoTable({
        head: [['Código', 'Tipo de Refeição', 'Data Criação', 'Nome', 'Empresa']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'center'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        }
      });

      doc.save('vouchers-descartaveis.pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vouchers Descartáveis Ativos</h3>
        {vouchers && vouchers.length > 0 && (
          <Button 
            onClick={downloadPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo Refeição</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vouchers || vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum voucher descartável ativo
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.codigo}</TableCell>
                  <TableCell>{voucher.tipos_refeicao?.nome}</TableCell>
                  <TableCell>
                    {format(new Date(voucher.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{voucher.nome_pessoa || '-'}</TableCell>
                  <TableCell>{voucher.nome_empresa || '-'}</TableCell>
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