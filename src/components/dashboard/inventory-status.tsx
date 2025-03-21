
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Available', value: 40, color: '#4ade80' },
  { name: 'In Use', value: 30, color: '#3b82f6' },
  { name: 'Repair', value: 15, color: '#f59e0b' },
  { name: 'Disposed', value: 15, color: '#ef4444' },
];

export function InventoryStatus() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value}%`, name]}
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
