import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '../../../config/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['report-metrics'],
    queryFn: async () => {
      const { data: usageData, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*');

      if (error) throw error;

      const totalCost = usageData.reduce((sum, item) => sum + (item.valor_refeicao || 0), 0);
      const averageCost = totalCost / (usageData.length || 1);
      
      const regularVouchers = usageData.filter(item => !item.voucher?.startsWith('TEMP')).length;
      const disposableVouchers = usageData.filter(item => item.voucher?.startsWith('TEMP')).length;

      // Segmentação por Empresa
      const byCompany = usageData.reduce((acc, item) => {
        const company = item.empresa || 'Não especificada';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      // Segmentação por Dia
      const byDay = usageData.reduce((acc, item) => {
        const day = format(new Date(item.usado_em), 'dd/MM/yyyy', { locale: ptBR });
        acc[day] = (acc[day] || 0) + 1;
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
        byDay,
        byShift,
        byMealType
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatValue = (value) => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {formatValue(metrics?.totalCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {formatValue(metrics?.averageCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Regulares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.regularVouchers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Descartáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.disposableVouchers || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segmentações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.byCompany && Object.entries(metrics.byCompany).map(([company, count]) => (
                <div key={company} className="flex justify-between items-center">
                  <span className="font-medium">{company}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.byDay && Object.entries(metrics.byDay).map(([day, count]) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="font-medium">{day}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Turno */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Turno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.byShift && Object.entries(metrics.byShift).map(([shift, count]) => (
                <div key={shift} className="flex justify-between items-center">
                  <span className="font-medium">{shift}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Tipo de Refeição */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Tipo de Refeição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.byMealType && Object.entries(metrics.byMealType).map(([mealType, count]) => (
                <div key={mealType} className="flex justify-between items-center">
                  <span className="font-medium">{mealType}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportMetrics;