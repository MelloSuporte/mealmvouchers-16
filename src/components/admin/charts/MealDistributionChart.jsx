import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
import { COLORS } from './ChartColors';

const MealDistributionChart = ({ data = [] }) => {
  // Ensure data is always an array
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full overflow-x-auto flex justify-center">
      <PieChart width={400} height={300}>
        <Pie
          data={chartData}
          cx={200}
          cy={150}
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default MealDistributionChart;