import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { COLORS } from './ChartColors';

const MealDistributionChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-center">Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry.nome}: ${entry.valor}`}
          labelLine={true}
        >
          {chartData.map((entry) => {
            const color = COLORS[entry.nome] || COLORS.EXTRA;
            return (
              <Cell 
                key={`cell-${entry.nome}`} 
                fill={color}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          })}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value} refeições`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MealDistributionChart;