
import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function InventoryStatus() {
  const [data, setData] = useState([
    { name: 'Loading...', value: 100, color: '#d1d5db' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: stockItems, error } = await supabase
          .from('stock_items')
          .select('status')
          .then(({ data, error }) => {
            if (error) throw error;
            
            // Count items by status
            const statusCount: Record<string, number> = {
              'available': 0,
              'in-use': 0,
              'repair': 0,
              'disposed': 0
            };
            
            data?.forEach(item => {
              if (statusCount[item.status] !== undefined) {
                statusCount[item.status]++;
              }
            });
            
            return { 
              data: Object.entries(statusCount).map(([status, count]) => ({ status, count })),
              error: null 
            };
          });
        
        if (error) {
          console.error('Error fetching inventory status:', error);
          return;
        }
        
        if (stockItems && stockItems.length > 0) {
          const formattedData = stockItems.map((item: any) => {
            let color;
            switch (item.status) {
              case 'available':
                color = '#4ade80';
                break;
              case 'in-use':
                color = '#3b82f6';
                break;
              case 'repair':
                color = '#f59e0b';
                break;
              case 'disposed':
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
              value: item.count,
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
      <div className="flex justify-center items-center h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
          formatter={(value, name) => [`${value}`, name]}
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
