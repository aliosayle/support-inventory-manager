
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  {
    name: 'Jan',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Feb',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Mar',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Apr',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'May',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Jun',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Jul',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Aug',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Sep',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Oct',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Nov',
    total: Math.floor(Math.random() * 50) + 20,
  },
  {
    name: 'Dec',
    total: Math.floor(Math.random() * 50) + 20,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
