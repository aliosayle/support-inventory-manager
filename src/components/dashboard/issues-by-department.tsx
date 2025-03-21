
import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function IssuesByDepartment() {
  const [data, setData] = useState([
    { name: 'Loading...', value: 100, color: '#d1d5db' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select('submitted_by');
        
        if (issuesError) throw issuesError;
        
        if (!issuesData || issuesData.length === 0) {
          setData([{ name: 'No Data', value: 100, color: '#d1d5db' }]);
          setLoading(false);
          return;
        }
        
        const userIds = issuesData
          .map(issue => issue.submitted_by)
          .filter((id, index, self) => self.indexOf(id) === index); // Get unique user IDs
        
        const { data: usersData, error: usersError } = await supabase
          .from('custom_users')
          .select('id, department')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Count issues by department
        const departmentCountMap = new Map();
        
        // Create mapping of user ID to department
        const userDepartmentMap = new Map();
        usersData?.forEach(user => {
          if (user.department) {
            userDepartmentMap.set(user.id, user.department);
          }
        });
        
        // Count issues by department
        issuesData.forEach(issue => {
          const department = userDepartmentMap.get(issue.submitted_by) || 'Unassigned';
          departmentCountMap.set(department, (departmentCountMap.get(department) || 0) + 1);
        });
        
        // Prepare data for chart
        const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];
        
        const chartData = Array.from(departmentCountMap.entries())
          .map(([department, count], index) => ({
            name: department,
            value: count,
            color: colors[index % colors.length]
          }));
        
        setData(chartData);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setData([{ name: 'Error', value: 100, color: '#ef4444' }]);
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
