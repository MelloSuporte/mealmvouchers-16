import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { COLORS } from './ChartColors';

const WeeklyUsageChart = ({ data }) => {
  // Ensure data is always an array and has a default value
  const chartData = Array.isArray(data) ? data : [];

  // If there's no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value || value === 0) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={100}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="almoco" name="Almoço" fill={COLORS.ALMOCO}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="jantar" name="Jantar" fill={COLORS.JANTAR}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="cafe" name="Café" fill={COLORS.CAFE}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="ceia" name="Ceia" fill={COLORS.CEIA || "#8B4513"}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="outros" name="Outros" fill={COLORS.OUTROS || "#808080"}>
          <LabelList content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyUsageChart;