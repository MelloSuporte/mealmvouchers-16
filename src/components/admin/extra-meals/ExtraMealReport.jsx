import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { generateReportPDF } from './pdfGenerator';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const ExtraMealReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: mealTypes } = useQuery({
    queryKey: ['mealTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refeicoes')
        .select('id, nome')
        .eq('ativo', true);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: meals } = useQuery({
    queryKey: ['extraMeals', dateRange, selectedMeal],
    queryFn: async () => {
      if (!dateRange.start || !dateRange.end) return [];
      
      let query = supabase
        .from('refeicoes_extras')
        .select(`
          *,
          usuarios (nome),
          refeicoes (nome)
        `)
        .gte('data_consumo', dateRange.start)
        .lte('data_consumo', dateRange.end)
        .order('data_consumo', { ascending: false });

      if (selectedMeal !== 'all') {
        query = query.eq('refeicoes', selectedMeal);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!(dateRange.start && dateRange.end)
  });

  const handleGenerateReport = () => {
    if (meals?.length) {
      generateReportPDF(meals, dateRange, selectedMeal, mealTypes);
    }
  };

  const handleGenerateExcel = () => {
    if (meals?.length) {
      const workbook = XLSX.utils.book_new();
      
      const formattedData = meals.map(meal => ({
        'Data': formatDate(meal.data_consumo),
        'Usuário': meal.usuarios?.nome || '-',
        'Refeição': meal.refeicoes?.nome || '-',
        'Quantidade': meal.quantidade || 0,
        'Valor': `R$ ${meal.valor.toFixed(2)}`
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Refeições Extras');
      
      const fileName = `relatorio-refeicoes-extras-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };

  const totalPages = meals ? Math.ceil(meals.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMeals = meals?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Data Inicial</Label>
            <Input
              type="date"
              id="start_date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data Final</Label>
            <Input
              type="date"
              id="end_date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Refeição</Label>
            <Select value={selectedMeal} onValueChange={setSelectedMeal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a refeição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {mealTypes?.map((meal) => (
                  <SelectItem key={meal.id} value={meal.id}>
                    {meal.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleGenerateReport}
            disabled={!meals?.length}
            className="w-fit px-4"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>

          <Button 
            onClick={handleGenerateExcel}
            disabled={!meals?.length}
            className="w-fit px-4 bg-green-500 hover:bg-green-600"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {paginatedMeals?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Refeições Encontradas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refeição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMeals.map((meal) => (
                    <tr key={meal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(meal.data_consumo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meal.usuarios?.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meal.refeicoes?.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meal.quantidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        R$ {meal.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExtraMealReport;
