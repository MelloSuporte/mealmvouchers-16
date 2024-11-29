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

  const getColorForMeal = (nome) => {
    const normalizedName = normalizeMealName(nome);
    return COLORS[normalizedName] || COLORS.PRIMARY;
  };

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
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.nome}`} fill={getColorForMeal(entry.nome)} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MealDistributionChart;