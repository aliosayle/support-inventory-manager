
import React, { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export function Overview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get issue creation dates for the last 12 months
        const now = new Date();
        const twelveMonthsAgo = subMonths(now, 12);
        
        const { data: issues, error } = await supabase
          .from('issues')
          .select('created_at')
          .gte('created_at', twelveMonthsAgo.toISOString());
        
        if (error) throw error;
        
        // Initialize counts for all months
        const monthlyCounts = new Map();
        for (let i = 0; i < 12; i++) {
          const month = subMonths(now, i);
          const monthKey = format(month, 'MMM');
          monthlyCounts.set(monthKey, 0);
        }
        
        // Count issues by month
        if (issues && issues.length > 0) {
          issues.forEach(issue => {
            if (!issue.created_at) return;
            
            const createdDate = parseISO(issue.created_at);
            const monthKey = format(createdDate, 'MMM');
            
            if (monthlyCounts.has(monthKey)) {
              monthlyCounts.set(monthKey, monthlyCounts.get(monthKey) + 1);
            }
          });
        }
        
        // Format data for chart in correct month order
        const monthOrder = Array.from({ length: 12 }, (_, i) => 
          format(subMonths(now, 11 - i), 'MMM')
        );
        
        const chartData = monthOrder.map(month => ({
          name: month,
          total: monthlyCounts.get(month) || 0
        }));
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        
        // On error, generate empty data
        const emptyData = Array.from({ length: 12 }, (_, i) => ({
          name: format(subMonths(new Date(), 11 - i), 'MMM'),
          total: 0
        }));
        
        setData(emptyData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
