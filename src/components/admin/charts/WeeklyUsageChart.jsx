import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { COLORS } from './ChartColors';

const WeeklyUsageChart = ({ data }) => (
  <div className="w-full overflow-x-auto">
    <BarChart width={800} height={300} data={data}>
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

export default WeeklyUsageChart;