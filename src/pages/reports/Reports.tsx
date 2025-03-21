
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Activity, TrendingUp, FileBarChart } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch issues by month data
  const { data: issuesByMonth = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['issuesByMonth'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_issues_by_month');
        
        if (error) throw error;
        
        // Format data for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        
        // If no data, create empty data structure
        if (!data || data.length === 0) {
          return months.map(name => ({ name, count: 0 }));
        }
        
        // Format data from database
        return data.map((item: any) => ({
          name: months[item.month - 1], // Convert month number to name
          count: parseInt(item.count)
        }));
      } catch (error) {
        console.error('Error fetching issues by month:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Fetch issues by type data
  const { data: issuesByType = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['issuesByType'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_issues_by_type');
        
        if (error) throw error;
        
        // Format data for chart
        return data.map((item: any) => ({
          name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          value: parseInt(item.count)
        }));
      } catch (error) {
        console.error('Error fetching issues by type:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Fetch resolution time data
  const { data: issueResolutionTime = [], isLoading: isLoadingResolution } = useQuery({
    queryKey: ['resolutionTime'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_resolution_time_by_week');
        
        if (error) throw error;
        
        // Format data for chart
        if (!data || data.length === 0) {
          return Array.from({ length: 8 }, (_, i) => ({ 
            name: `Week ${i + 1}`, 
            time: 0 
          }));
        }
        
        return data.map((item: any) => ({
          name: `Week ${item.week_number}`,
          time: parseFloat(item.avg_hours.toFixed(1))
        }));
      } catch (error) {
        console.error('Error fetching resolution time:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Fetch issues stats
  const { data: issueStats = { total: 0, open: 0, resolved: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['issueStats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_issue_stats');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return { total: 0, open: 0, resolved: 0, avg_resolution: 0 };
        }
        
        return {
          total: parseInt(data[0].total_issues || 0),
          open: parseInt(data[0].open_issues || 0),
          resolved: parseInt(data[0].resolved_issues || 0),
          avg_resolution: parseFloat(data[0].avg_resolution_time || 0)
        };
      } catch (error) {
        console.error('Error fetching issue stats:', error);
        return { total: 0, open: 0, resolved: 0, avg_resolution: 0 };
      }
    },
    staleTime: 300000, // 5 minutes
  });
  
  const isLoading = isLoadingMonthly || isLoadingTypes || isLoadingResolution || isLoadingStats;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View analytics and reports for IT support activities
        </p>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity size={16} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <FileBarChart size={16} />
            <span>Issues</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Issues</CardTitle>
                <CardDescription>All time issue count</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{issueStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      All tracked issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Open Issues</CardTitle>
                <CardDescription>Unresolved issues</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{issueStats.open}</div>
                    <p className="text-xs text-muted-foreground">
                      {issueStats.total > 0 ? 
                        `${Math.round((issueStats.open / issueStats.total) * 100)}% of total issues` : 
                        'No issues recorded'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg. Resolution Time</CardTitle>
                <CardDescription>Hours to resolve</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {issueStats.avg_resolution.toFixed(1)} hrs
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For {issueStats.resolved} resolved issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Issues by Type</CardTitle>
                  <PieChart size={16} />
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={issuesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {issuesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Issues by Month</CardTitle>
                  <BarChart size={16} />
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={issuesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Breakdown</CardTitle>
              <CardDescription>Detailed analysis of issue distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={issuesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Trends</CardTitle>
              <CardDescription>Average time to resolve issues (hours)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={issueResolutionTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="time" stroke="#6366f1" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
