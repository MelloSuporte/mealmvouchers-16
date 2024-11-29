import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="almoco" name="Almoço" fill={COLORS.ALMOCO} />
        <Bar dataKey="jantar" name="Jantar" fill={COLORS.JANTAR} />
        <Bar dataKey="cafe" name="Café" fill={COLORS.CAFE} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyUsageChart;