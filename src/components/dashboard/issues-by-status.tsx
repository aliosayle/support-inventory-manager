
import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function IssuesByStatus() {
  const [data, setData] = useState([
    { name: 'Loading...', value: 100, color: '#d1d5db' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: issueStatuses, error } = await supabase.rpc('get_issues_by_status');
        
        if (error) {
          console.error('Error fetching issues by status:', error);
          return;
        }
        
        if (issueStatuses && issueStatuses.length > 0) {
          const formattedData = issueStatuses.map((item: any) => {
            let color;
            switch (item.status) {
              case 'submitted':
                color = '#3b82f6';
                break;
              case 'in-progress':
                color = '#f59e0b';
                break;
              case 'resolved':
                color = '#4ade80';
                break;
              case 'escalated':
                color = '#ef4444';
                break;
              default:
                color = '#8884d8';
            }
            
            const name = item.status
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            return {
              name: name,
              value: Number(item.count),
              color: color
            };
          });
          
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[250px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
