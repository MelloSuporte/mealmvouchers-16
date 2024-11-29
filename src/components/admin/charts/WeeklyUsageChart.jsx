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
        <Bar dataKey="Café da Manhã" name="Café da Manhã" fill={COLORS.CAFE}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="Almoço" name="Almoço" fill={COLORS.ALMOCO}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="Lanche" name="Lanche" fill={COLORS.LANCHE}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="Jantar" name="Jantar" fill={COLORS.JANTAR}>
          <LabelList content={renderCustomLabel} />
        </Bar>
        <Bar dataKey="Ceia" name="Ceia" fill={COLORS.CEIA}>
          <LabelList content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyUsageChart;