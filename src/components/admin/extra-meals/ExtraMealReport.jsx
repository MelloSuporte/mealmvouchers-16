import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';
import { generateReportPDF } from './pdfGenerator';

const ExtraMealReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const { data: meals } = useQuery({
    queryKey: ['extraMeals', dateRange],
    queryFn: async () => {
      if (!dateRange.start || !dateRange.end) return [];
      
      const { data, error } = await supabase
        .from('refeicoes_extras')
        .select(`
          *,
          usuarios (nome),
          tipos_refeicao (nome)
        `)
        .gte('data_consumo', dateRange.start)
        .lte('data_consumo', dateRange.end)
        .order('data_consumo', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!(dateRange.start && dateRange.end)
  });

  const handleGenerateReport = () => {
    if (meals?.length) {
      generateReportPDF(meals, dateRange);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <Button 
          onClick={handleGenerateReport}
          disabled={!meals?.length}
          className="w-full"
        >
          Gerar Relatório PDF
        </Button>

        {meals?.length > 0 && (
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
                  {meals.map((meal) => (
                    <tr key={meal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(meal.data_consumo).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meal.usuarios.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {meal.tipos_refeicao.nome}
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
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExtraMealReport;