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
  console.log('Vouchers recebidos na tabela:', vouchers); // Debug log

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont("helvetica");
      
      // Título do documento
      doc.setFontSize(16);
      doc.text("Vouchers Descartáveis", 14, 15);
      
      // Preparar dados para a tabela
      const tableData = vouchers.map(voucher => [
        voucher.codigo,
        voucher.tipos_refeicao?.nome || '',
        format(new Date(voucher.data_expiracao), 'dd/MM/yyyy', { locale: ptBR }),
        voucher.tipos_refeicao?.valor ? `R$ ${voucher.tipos_refeicao.valor.toFixed(2)}` : ''
      ]);

      console.log('Dados preparados para PDF:', tableData); // Debug log

      // Gerar tabela
      doc.autoTable({
        head: [['Código', 'Tipo de Refeição', 'Data de Expiração', 'Valor']],
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

      // Salvar o PDF
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
        {vouchers.length > 0 && (
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
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Tipo de Refeição</TableHead>
              <TableHead>Data de Expiração</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum voucher descartável ativo
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.codigo}</TableCell>
                  <TableCell>{voucher.tipos_refeicao?.nome}</TableCell>
                  <TableCell>
                    {format(new Date(voucher.data_expiracao), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    {voucher.tipos_refeicao?.valor ? 
                      `R$ ${voucher.tipos_refeicao.valor.toFixed(2)}` : 
                      '-'
                    }
                  </TableCell>
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