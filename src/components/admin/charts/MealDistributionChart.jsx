import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { COLORS, normalizeMealName } from './ChartColors';

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
            const normalizedName = normalizeMealName(entry.nome);
            console.log('Nome original:', entry.nome);
            console.log('Nome normalizado:', normalizedName);
            console.log('Cor aplicada:', COLORS[normalizedName]);
            return (
              <Cell 
                key={`cell-${entry.nome}`} 
                fill={COLORS[normalizedName]} 
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