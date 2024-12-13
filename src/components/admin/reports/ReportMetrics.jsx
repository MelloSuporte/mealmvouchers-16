import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '../../../config/supabase';
import { format, startOfDay, endOfDay } from 'date-fns';
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
      console.log('Consultando métricas com filtros:', filters);

      // Primeiro, vamos buscar os dados base
      const { data: usageData, error: usageError } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*');

      if (usageError) {
        console.error('Erro ao buscar dados:', usageError);
        toast.error('Erro ao carregar dados');
        throw usageError;
      }

      console.log('Dados brutos retornados:', usageData);

      // Filtragem dos dados
      let filteredData = usageData;

      // Filtro por data
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.data_uso);
        return itemDate >= filters.startDate && itemDate <= filters.endDate;
      });

      // Filtro por empresa
      if (filters.company !== 'all') {
        filteredData = filteredData.filter(item => item.empresa === filters.company);
      }

      // Filtro por turno
      if (filters.shift !== 'all') {
        filteredData = filteredData.filter(item => item.turno === filters.shift);
      }

      // Filtro por tipo de refeição
      if (filters.mealType !== 'all') {
        filteredData = filteredData.filter(item => item.tipo_refeicao === filters.mealType);
      }

      console.log('Dados filtrados:', filteredData);

      // Cálculo das métricas
      const totalCost = filteredData.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0);
      const averageCost = filteredData.length > 0 ? totalCost / filteredData.length : 0;
      
      const regularVouchers = filteredData.filter(item => item.tipo_voucher === 'comum').length;
      const disposableVouchers = filteredData.filter(item => item.tipo_voucher === 'descartavel').length;

      // Agrupamentos para os filtros
      const byCompany = groupBy(filteredData, 'empresa');
      const byShift = groupBy(filteredData, 'turno');
      const byMealType = groupBy(filteredData, 'tipo_refeicao');

      return {
        totalCost,
        averageCost,
        regularVouchers,
        disposableVouchers,
        byCompany,
        byShift,
        byMealType,
        filteredData
      };
    }
  });

  const groupBy = (array, key) => {
    return array.reduce((acc, item) => {
      const groupKey = item[key] || 'Não especificado';
      acc[groupKey] = (acc[groupKey] || 0) + 1;
      return acc;
    }, {});
  };

  const handleFilterChange = (filterType, value) => {
    console.log('Alterando filtro:', filterType, 'para:', value);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExportClick = () => {
    if (!metrics?.filteredData) {
      toast.error("Não há dados para exportar");
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Relatório de Custos de Refeições", 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Período: ${format(filters.startDate, 'dd/MM/yyyy')} a ${format(filters.endDate, 'dd/MM/yyyy')}`, 14, 25);
      doc.text(`Empresa: ${filters.company === 'all' ? 'Todas' : filters.company}`, 14, 30);
      doc.text(`Turno: ${filters.shift === 'all' ? 'Todos' : filters.shift}`, 14, 35);
      doc.text(`Tipo de Refeição: ${filters.mealType === 'all' ? 'Todos' : filters.mealType}`, 14, 40);

      const tableData = metrics.filteredData.map(item => [
        format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm'),
        item.nome_usuario || '-',
        item.codigo_voucher || '-',
        item.tipo_refeicao || '-',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_refeicao || 0),
        item.turno || '-'
      ]);

      doc.autoTable({
        startY: 50,
        head: [['Data/Hora', 'Usuário', 'Voucher', 'Refeição', 'Valor', 'Turno']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      doc.save(`relatorio-refeicoes-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar relatório. Por favor, tente novamente.");
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
          Exportar Relatório
        </Button>
      </div>
      <MetricsCards metrics={metrics} />
    </div>
  );
};

export default ReportMetrics;