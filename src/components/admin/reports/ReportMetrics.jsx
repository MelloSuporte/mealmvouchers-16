import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import ExportButton from './components/ExportButton';
import LoadingMetrics from './components/LoadingMetrics';
import { useReportFilters } from './hooks/useReportFilters';
import { useUsageData } from './hooks/useUsageData';
import { useMetricsCalculation } from './hooks/useMetricsCalculation';
import { supabase } from '@/config/supabase';

const ReportMetrics = () => {
  const { filters, handleFilterChange } = useReportFilters();
  const { data: usageData, isLoading: isLoadingUsage, error: usageError, refetch } = useUsageData(filters);
  const metrics = useMetricsCalculation(usageData);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleForceSync = async () => {
    try {
      setIsSyncing(true);
      toast.info("Iniciando sincronização dos dados...");

      // Buscar todos os dados da view
      const { data: viewData, error: viewError } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*');

      if (viewError) throw viewError;

      // Sincronizar com a tabela de relatório
      const { error: syncError } = await supabase
        .from('relatorio_uso_voucher')
        .upsert(
          viewData.map(item => ({
            data_uso: item.data_uso,
            usuario_id: item.usuario_id,
            nome_usuario: item.nome_usuario,
            cpf: item.cpf,
            empresa_id: item.empresa_id,
            nome_empresa: item.nome_empresa,
            turno: item.turno,
            setor_id: item.setor_id,
            nome_setor: item.nome_setor,
            tipo_refeicao: item.tipo_refeicao,
            valor: item.valor_refeicao,
            observacao: item.observacao
          })),
          { onConflict: ['data_uso', 'usuario_id', 'tipo_refeicao'] }
        );

      if (syncError) throw syncError;

      toast.success(`Sincronização concluída! ${viewData.length} registros processados.`);
      refetch(); // Recarrega os dados após a sincronização
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados: ' + error.message);
    } finally {
      setIsSyncing(false);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="whitespace-nowrap"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              'Forçar Sincronização'
            )}
          </Button>
          <ExportButton 
            metrics={metrics}
            filters={filters}
            isLoading={isLoadingUsage}
          />
        </div>
      </div>
      
      {isLoadingUsage ? (
        <LoadingMetrics />
      ) : !usageData?.length ? (
        <Alert>
          <AlertDescription className="text-gray-600 text-center py-4">
            Nenhum dado encontrado para o período e filtros selecionados.
            <br />
            <span className="text-sm">
              Tente ajustar os filtros ou selecione um período diferente.
            </span>
          </AlertDescription>
        </Alert>
      ) : (
        <MetricsCards metrics={metrics} />
      )}
    </div>
  );
};

export default ReportMetrics;