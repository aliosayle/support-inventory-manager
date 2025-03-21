
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'IT', value: 25, color: '#4f46e5' },
  { name: 'Finance', value: 15, color: '#0ea5e9' },
  { name: 'HR', value: 10, color: '#10b981' },
  { name: 'Marketing', value: 20, color: '#f59e0b' },
  { name: 'Operations', value: 30, color: '#ef4444' },
];

export function IssuesByDepartment() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
