import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { exportToPDF } from './utils/pdfExport';
import { useReportFilters } from './hooks/useReportFilters';
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

const ReportMetrics = () => {
  const { filters, handleFilterChange } = useReportFilters();
  
  const { data: usageData, isLoading: isLoadingUsage, error: usageError } = useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados de uso com filtros:', filters);
        
        let query = supabase
          .from('uso_voucher')
          .select(`
            *,
            usuarios!uso_voucher_usuario_id_fkey (
              id,
              nome,
              cpf,
              setor_id,
              empresa:empresas (
                id,
                nome
              ),
              turno:turnos (
                tipo_turno
              )
            ),
            tipo_refeicao:tipos_refeicao (
              nome,
              valor
            )
          `);

        if (filters.company && filters.company !== 'all') {
          query = query.eq('usuarios.empresa_id', filters.company);
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setUTCHours(0, 0, 0, 0);
          query = query.gte('usado_em', startDate.toISOString());
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setUTCHours(23, 59, 59, 999);
          query = query.lte('usado_em', endDate.toISOString());
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('usuarios.turno.tipo_turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('usuarios.setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          query = query.eq('tipo_refeicao.nome', filters.mealType);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar dados:', error);
          throw error;
        }

        // Transform data to match the expected format
        const transformedData = data.map(item => ({
          id: item.id,
          usado_em: item.usado_em,
          nome_usuario: item.usuarios?.nome,
          cpf: item.usuarios?.cpf,
          empresa: item.usuarios?.empresa?.nome,
          tipo_refeicao: item.tipo_refeicao?.nome,
          valor: item.tipo_refeicao?.valor,
          turno: item.usuarios?.turno?.tipo_turno,
          setor_id: item.usuarios?.setor_id
        }));

        console.log('Dados transformados:', transformedData);
        return transformedData || [];
      } catch (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
  });

  const metrics = React.useMemo(() => {
    if (!usageData) return null;

    const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
    const regularVouchers = usageData.filter(item => item.tipo_voucher === 'comum').length;
    const disposableVouchers = usageData.filter(item => item.tipo_voucher === 'descartavel').length;

    return {
      totalCost,
      averageCost: usageData.length > 0 ? totalCost / usageData.length : 0,
      regularVouchers,
      disposableVouchers,
      filteredData: usageData
    };
  }, [usageData]);

  const handleExportClick = async () => {
    try {
      if (!metrics?.filteredData?.length) {
        toast.error("Não há dados para exportar no período selecionado");
        return;
      }

      console.log('Iniciando exportação com dados:', {
        metricsLength: metrics?.filteredData?.length,
        filters,
        metrics
      });

      await exportToPDF(metrics, filters);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  if (usageError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados: {usageError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ReportFilters 
            onFilterChange={handleFilterChange}
            startDate={filters.startDate}
            endDate={filters.endDate}
          />
        </div>
        <Button 
          onClick={handleExportClick}
          className="ml-4"
          disabled={!metrics?.filteredData?.length || isLoadingUsage}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      
      {isLoadingUsage ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : metrics?.filteredData?.length === 0 ? (
        <Alert>
          <AlertDescription>
            Nenhum dado encontrado para o período e filtros selecionados.
          </AlertDescription>
        </Alert>
      ) : (
        <MetricsCards metrics={metrics} />
      )}
    </div>
  );
};

export default ReportMetrics;