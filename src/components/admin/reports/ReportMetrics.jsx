import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '../../../config/supabase';
import { format, startOfDay, endOfDay, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

const ReportMetrics = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    mealType: 'all'
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['report-metrics', filters],
    queryFn: async () => {
      console.log('Consultando métricas de:', filters.startDate, 'até:', filters.endDate);

      let query = supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .gte('data_uso', filters.startDate.toISOString())
        .lte('data_uso', filters.endDate.toISOString());

      // Aplicar filtros adicionais
      if (filters.company !== 'all') {
        query = query.eq('empresa', filters.company);
      }
      if (filters.shift !== 'all') {
        query = query.eq('turno', filters.shift);
      }
      if (filters.mealType !== 'all') {
        query = query.eq('tipo_refeicao', filters.mealType);
      }

      const { data: usageData, error } = await query;

      if (error) {
        console.error('Erro ao buscar métricas:', error);
        toast.error('Erro ao carregar dados');
        throw error;
      }

      console.log('Dados das métricas retornados:', usageData);

      const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0);
      const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;
      
      const regularVouchers = usageData.filter(item => item.tipo_voucher === 'comum').length;
      const disposableVouchers = usageData.filter(item => item.tipo_voucher === 'descartavel').length;

      // Segmentação por Empresa
      const byCompany = usageData.reduce((acc, item) => {
        const company = item.empresa || 'Não especificada';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Turno
      const byShift = usageData.reduce((acc, item) => {
        const shift = item.turno || 'Não especificado';
        acc[shift] = (acc[shift] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Tipo de Refeição
      const byMealType = usageData.reduce((acc, item) => {
        const mealType = item.tipo_refeicao || 'Não especificado';
        acc[mealType] = (acc[mealType] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCost,
        averageCost,
        regularVouchers,
        disposableVouchers,
        byCompany,
        byShift,
        byMealType,
        filteredData: usageData
      };
    }
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-';
  };

  const handleExportClick = () => {
    try {
      if (!metrics?.filteredData) {
        toast.error("Não há dados para exportar");
        return;
      }

      const doc = new jsPDF();
      
      // Título do relatório
      doc.setFontSize(16);
      doc.text("Relatório Custos de Refeições", 14, 15);
      
      // Informações do filtro
      doc.setFontSize(10);
      doc.text(`Período: ${format(filters.startDate, 'dd/MM/yyyy')} a ${format(filters.endDate, 'dd/MM/yyyy')}`, 14, 25);
      doc.text(`Empresa: ${filters.company === 'all' ? 'Todas' : filters.company}`, 14, 30);
      doc.text(`Turno: ${filters.shift === 'all' ? 'Todos' : filters.shift}`, 14, 35);
      doc.text(`Tipo de Refeição: ${filters.mealType === 'all' ? 'Todos' : filters.mealType}`, 14, 40);

      // Resumo
      doc.text("Resumo:", 14, 50);
      doc.text(`Total de Vouchers: ${metrics.regularVouchers + metrics.disposableVouchers}`, 14, 55);
      doc.text(`Custo Total: ${formatCurrency(metrics.totalCost)}`, 14, 60);
      doc.text(`Custo Médio: ${formatCurrency(metrics.averageCost)}`, 14, 65);

      // Tabela de dados
      const tableData = metrics.filteredData.map(item => [
        formatDate(item.data_uso),
        item.nome_usuario || '-',
        item.codigo_voucher || '-',
        item.tipo_refeicao || '-',
        formatCurrency(item.valor_refeicao || 0),
        item.turno || '-'
      ]);

      doc.autoTable({
        startY: 75,
        head: [['Data/Hora', 'Usuário', 'Voucher', 'Refeição', 'Valor', 'Turno']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      // Download do PDF
      doc.save(`relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF. Por favor, tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ReportFilters 
            metrics={metrics} 
            onFilterChange={handleFilterChange}
            startDate={filters.startDate}
            endDate={filters.endDate}
          />
        </div>
        <Button 
          onClick={handleExportClick}
          className="ml-4"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Filtrado
        </Button>
      </div>
      <MetricsCards metrics={metrics} />
    </div>
  );
};

export default ReportMetrics;