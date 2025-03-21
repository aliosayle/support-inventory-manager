
import React, { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, differenceInHours, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export function IssueResolutionTime() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get resolved issues with created_at and resolved_at dates
        const { data: resolvedIssues, error } = await supabase
          .from('issues')
          .select('created_at, resolved_at')
          .eq('status', 'resolved')
          .not('resolved_at', 'is', null);
        
        if (error) throw error;
        
        if (!resolvedIssues || resolvedIssues.length === 0) {
          // If no data, generate empty chart data
          const emptyData = generateEmptyMonthsData();
          setData(emptyData);
          setLoading(false);
          return;
        }
        
        // Group by month and calculate average resolution time
        const monthlyData = new Map();
        
        resolvedIssues.forEach(issue => {
          if (!issue.created_at || !issue.resolved_at) return;
          
          const createdDate = parseISO(issue.created_at);
          const resolvedDate = parseISO(issue.resolved_at);
          const monthKey = format(createdDate, 'MMM');
          
          const resolutionHours = differenceInHours(resolvedDate, createdDate);
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { total: resolutionHours, count: 1 });
          } else {
            const current = monthlyData.get(monthKey);
            monthlyData.set(monthKey, { 
              total: current.total + resolutionHours, 
              count: current.count + 1 
            });
          }
        });
        
        // Calculate averages and format for chart
        const chartData = Array.from(monthlyData.entries())
          .map(([month, { total, count }]) => ({
            month,
            time: Math.round(total / count)
          }));
        
        // If we have less than 12 months of data, fill in the missing months
        if (chartData.length < 12) {
          const existingMonths = new Set(chartData.map(item => item.month));
          const allMonthsData = generateEmptyMonthsData();
          
          const filledData = allMonthsData.map(monthData => {
            const found = chartData.find(item => item.month === monthData.month);
            return found || monthData;
          });
          
          setData(filledData);
        } else {
          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching resolution time data:', error);
        // If error, generate empty chart data
        const emptyData = generateEmptyMonthsData();
        setData(emptyData);
      } finally {
        setLoading(false);
      }
    }
    
    function generateEmptyMonthsData() {
      const months = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const month = subMonths(now, i);
        months.push({
          month: format(month, 'MMM'),
          time: 0
        });
      }
      
      return months;
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
        <Tooltip 
          labelStyle={{ fontWeight: 'bold' }} 
          formatter={(value) => [`${value} hours`, 'Avg. Resolution Time']} 
        />
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
