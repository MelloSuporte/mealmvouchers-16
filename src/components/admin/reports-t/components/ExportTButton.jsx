import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logger from '@/config/logger';

const ExportTButton = ({ filters }) => {
  const { data, isLoading } = useReportsTData(filters);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExport = async () => {
    try {
      logger.info('Iniciando exportação do relatório T', {
        filters,
        recordCount: data?.length || 0
      });

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text("Relatório de Uso de Vouchers", 14, 15);
      
      // Informações do usuário que exportou
      doc.setFontSize(10);
      const currentUser = "Sistema"; // TODO: Pegar nome do usuário logado
      const exportDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      doc.text(`Exportado por: ${currentUser} em ${exportDate}`, 14, 25);

      // Informações do Relatório
      logger.info('Adicionando informações do relatório ao PDF');
      doc.setFontSize(12);
      doc.text("Informações do Relatório:", 14, 35);

      // Empresa
      const empresaNome = filters.company === 'all' ? 'Todas as Empresas' : data?.[0]?.nome_empresa || 'Empresa não especificada';
      doc.text(`Empresa: ${empresaNome}`, 14, 45);

      // Período
      const startDate = filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
      const endDate = filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
      doc.text(`Período: ${startDate} a ${endDate}`, 14, 55);

      // Turno
      const turnoNome = filters.shift === 'all' ? 'Todos os Turnos' : data?.[0]?.turno || 'Turno não especificado';
      doc.text(`Turno: ${turnoNome}`, 14, 65);

      // Setor
      const setorNome = filters.sector === 'all' ? 'Todos os Setores' : data?.[0]?.nome_setor || 'Setor não especificado';
      doc.text(`Setor: ${setorNome}`, 14, 75);

      // Tipo de Refeição
      const tipoRefeicao = filters.mealType === 'all' ? 'Todos os Tipos' : data?.[0]?.tipo_refeicao || 'Tipo não especificado';
      doc.text(`Tipo de Refeição: ${tipoRefeicao}`, 14, 85);

      // Valor Total
      const totalValue = data?.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0) || 0;
      logger.info(`Valor total calculado: ${totalValue}`);
      doc.text(`Valor Total: ${formatCurrency(totalValue)}`, 14, 95);

      // Mensagem quando não há dados
      if (!data || data.length === 0) {
        logger.warn('Nenhum dado encontrado para exportação');
        doc.text("Nenhum registro encontrado para o período selecionado.", 14, 115);
      } else {
        logger.info('Gerando tabelas do relatório');
        
        // Tabela de Vouchers Usados
        doc.setFontSize(14);
        doc.text("Vouchers Utilizados", 14, 115);
        
        const tableData = data.map(item => [
          format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          item.nome_usuario || '-',
          item.cpf || '-',
          item.nome_empresa || '-',
          item.tipo_refeicao || '-',
          formatCurrency(item.valor_refeicao || 0),
          item.turno || '-',
          item.nome_setor || '-'
        ]);

        logger.info(`Processados ${tableData.length} registros para a tabela de vouchers usados`);

        doc.autoTable({
          startY: 125,
          head: [['Data/Hora', 'Usuário', 'CPF', 'Empresa', 'Refeição', 'Valor', 'Turno', 'Setor']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: { 
            fillColor: [66, 66, 66],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 },
            7: { cellWidth: 20 }
          }
        });

        // Tabela de Vouchers Descartáveis
        const vouchersDescartaveis = data.filter(item => item.tipo_voucher === 'descartavel');
        logger.info(`Encontrados ${vouchersDescartaveis.length} vouchers descartáveis`);

        const currentY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.text("Vouchers Descartáveis", 14, currentY);

        const vouchersDescartaveisData = vouchersDescartaveis.map(item => [
          item.codigo || '-',
          item.tipo_refeicao || '-',
          format(new Date(item.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          item.data_uso ? format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
          format(new Date(item.data_expiracao), 'dd/MM/yyyy', { locale: ptBR }),
          item.usado ? 'Sim' : 'Não'
        ]);

        doc.autoTable({
          startY: currentY + 10,
          head: [['Código', 'Tipo Refeição', 'Data Criação', 'Data Uso', 'Data Expiração', 'Usado']],
          body: vouchersDescartaveisData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: { 
            fillColor: [66, 66, 66],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 35 },
            5: { cellWidth: 20 }
          }
        });
      }

      const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
      doc.save(fileName);
      
      logger.info('Relatório exportado com sucesso', { fileName });
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar relatório:', {
        error: error.message,
        stack: error.stack,
        filters: filters
      });
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isLoading}
      className="bg-primary hover:bg-primary/90 text-white"
      size="sm"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportTButton;