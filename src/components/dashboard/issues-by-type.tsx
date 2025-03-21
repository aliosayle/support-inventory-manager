
import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function IssuesByType() {
  const [data, setData] = useState([
    { name: 'Loading...', value: 100, color: '#d1d5db' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: issueTypes, error } = await supabase.rpc('get_issues_by_type');
        
        if (error) {
          console.error('Error fetching issues by type:', error);
          return;
        }
        
        if (issueTypes && issueTypes.length > 0) {
          const formattedData = issueTypes.map((item: any) => {
            let color;
            switch (item.type) {
              case 'hardware':
                color = '#4f46e5';
                break;
              case 'software':
                color = '#0ea5e9';
                break;
              case 'network':
                color = '#10b981';
                break;
              default:
                color = '#8884d8';
            }
            
            return {
              name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
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
