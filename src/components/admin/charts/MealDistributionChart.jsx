import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
import { COLORS } from './ChartColors';

const MealDistributionChart = ({ data }) => (
  <div className="w-full overflow-x-auto flex justify-center">
    <PieChart width={400} height={300}>
      <Pie
        data={data}
        cx={200}
        cy={150}
        labelLine={false}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>
);

export default MealDistributionChart;