import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { COLORS } from './ChartColors';

const WeeklyUsageChart = ({ data }) => {
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
    <div className="w-full overflow-x-auto">
      <BarChart width={800} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Almoço" fill={COLORS.ALMOCO} />
        <Bar dataKey="Jantar" fill={COLORS.JANTAR} />
        <Bar dataKey="Café" fill={COLORS.CAFE} />
      </BarChart>
    </div>
  );
};

export default WeeklyUsageChart;