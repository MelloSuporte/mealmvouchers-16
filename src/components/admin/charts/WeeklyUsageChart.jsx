import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { COLORS, normalizeMealName } from './ChartColors';

const WeeklyUsageChart = ({ data, tiposRefeicao }) => {
  const chartData = Array.isArray(data) ? data : [];

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

  const getColorForMeal = (tipo) => {
    const normalizedName = normalizeMealName(tipo);
    return COLORS[normalizedName] || COLORS.PRIMARY;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={100}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Legend />
        {tiposRefeicao.map((tipo) => (
          <Bar 
            key={tipo} 
            dataKey={tipo} 
            name={tipo} 
            fill={getColorForMeal(tipo)}
          >
            <LabelList content={renderCustomLabel} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyUsageChart;