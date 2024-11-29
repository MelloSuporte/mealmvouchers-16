import React from 'react';
import ReportMetrics from './reports/ReportMetrics';
import ChartTabs from './reports/ChartTabs';

const ReportForm = () => {
  return (
    <div className="space-y-6">
      <ReportMetrics />
      <ChartTabs />
    </div>
  );
};

export default ReportForm;