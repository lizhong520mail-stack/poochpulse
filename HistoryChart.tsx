
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { HealthReport } from '../types';

interface HistoryChartProps {
  reports: HealthReport[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ reports }) => {
  const data = reports.slice().reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    score: r.score,
    fullDate: r.date
  }));

  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">健康趋势 (1-7 分)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#94a3b8'}}
          />
          <YAxis 
            domain={[1, 7]} 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#94a3b8'}}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          {/* Highlight Ideal Zone (2-3) */}
          <ReferenceArea y1={2} y2={3} fill="#10b981" fillOpacity={0.1} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
