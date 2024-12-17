import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from "../../charts/ChartColors";

const TrendChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-center">Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dia" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            name="Total de Usos" 
            stroke={COLORS.ALMOCO}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;