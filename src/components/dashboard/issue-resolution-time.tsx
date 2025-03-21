
import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Jan', time: 24 },
  { month: 'Feb', time: 22 },
  { month: 'Mar', time: 18 },
  { month: 'Apr', time: 16 },
  { month: 'May', time: 20 },
  { month: 'Jun', time: 22 },
  { month: 'Jul', time: 24 },
  { month: 'Aug', time: 28 },
  { month: 'Sep', time: 26 },
  { month: 'Oct', time: 22 },
  { month: 'Nov', time: 20 },
  { month: 'Dec', time: 18 },
];

export function IssueResolutionTime() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} hrs`}
        />
        <Tooltip labelStyle={{ fontWeight: 'bold' }} formatter={(value) => [`${value} hours`, 'Avg. Resolution Time']} />
        <Line
          type="monotone"
          dataKey="time"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
