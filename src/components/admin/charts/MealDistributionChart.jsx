import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { COLORS } from './ChartColors';

const MealDistributionChart = ({ data }) => {
  // Ensure data is always an array and has a default value
  const chartData = Array.isArray(data) ? data : [];

  // If there's no data, show empty state
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
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MealDistributionChart;