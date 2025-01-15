import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, FilePdf, BarChart } from "lucide-react";
import ReportsTCharts from './ReportsTCharts';
import ReportsTFilters from './ReportsTFilters';
import { ExportTButton } from './components/ExportTButton';

const ReportsTForm = () => {
  const [filters, setFilters] = React.useState({});
  const [showNoDataMessage, setShowNoDataMessage] = React.useState(false);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">
            <BarChart className="h-4 w-4 mr-2" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="excel">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <FilePdf className="h-4 w-4 mr-2" />
            PDF
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ReportsTFilters onFilterChange={handleFilterChange} filters={filters} />
      
      {!showNoDataMessage && (
        <ReportsTCharts filters={filters} />
      )}
    </div>
  );
};

export default ReportsTForm;
