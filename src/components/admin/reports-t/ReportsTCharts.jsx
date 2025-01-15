import React from 'react';
import { useReportsTData } from './hooks/useReportsTData';

const ReportsTCharts = ({ filters }) => {
  const { data, isLoading } = useReportsTData(filters);

  if (isLoading) {
    return <div className="text-center p-4">Carregando dados...</div>;
  }

  if (!data?.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        Nenhum dado encontrado para o período e filtros selecionados.
        <br />
        Tente ajustar os filtros ou selecione um período diferente.
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="text-center text-gray-700">
        Selecione os filtros desejados e utilize os botões de exportação para gerar relatórios.
      </div>
    </div>
  );
};

export default ReportsTCharts;