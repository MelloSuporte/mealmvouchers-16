import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { COLORS } from './ChartColors';

const MealDistributionChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        Nenhum dado disponível
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
          label={(entry) => entry.nome}
        >
          {chartData.map((entry) => {
            const color = COLORS[entry.nome] || COLORS.EXTRA;
            console.log('Nome da refeição:', entry.nome);
            console.log('Cor aplicada:', color);
            return (
              <Cell 
                key={`cell-${entry.nome}`} 
                fill={color}
              />
            );
          })}
        </Pie>
        <Tooltip formatter={(value) => [`${value} refeições`, 'Quantidade']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MealDistributionChart;