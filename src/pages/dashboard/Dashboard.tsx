
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/dashboard/overview';
import { RecentIssues } from '@/components/dashboard/recent-issues';
import { InventoryStatus } from '@/components/dashboard/inventory-status';
import { IssuesByType } from '@/components/dashboard/issues-by-type';
import { IssuesByStatus } from '@/components/dashboard/issues-by-status';
import { IssuesByDepartment } from '@/components/dashboard/issues-by-department';
import { IssueResolutionTime } from '@/components/dashboard/issue-resolution-time';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDateRangePicker } from '@/components/dashboard/date-range-picker';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
    avgResolutionTime: 0,
    inventoryItems: 0,
    lowStockItems: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch total issues count
        const { count: totalIssues } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true });

        // Fetch open issues count
        const { count: openIssues } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .in('status', ['submitted', 'in-progress']);

        // Fetch resolved issues count
        const { count: resolvedIssues } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved');

        // Fetch critical issues count
        const { count: criticalIssues } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('severity', 'high')
          .in('status', ['submitted', 'in-progress']);

        // Fetch inventory stats
        const { count: inventoryItems } = await supabase
          .from('stock_items')
          .select('*', { count: 'exact', head: true });

        const { count: lowStockItems } = await supabase
          .from('stock_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'repair');

        // Calculate average resolution time
        const { data: resolvedIssuesData } = await supabase
          .from('issues')
          .select('created_at, resolved_at')
          .eq('status', 'resolved')
          .not('resolved_at', 'is', null);

        let avgResolutionTime = 0;
        if (resolvedIssuesData && resolvedIssuesData.length > 0) {
          const totalTime = resolvedIssuesData.reduce((sum, issue) => {
            const createdAt = new Date(issue.created_at);
            const resolvedAt = new Date(issue.resolved_at);
            const diffTime = Math.abs(resolvedAt.getTime() - createdAt.getTime());
            const diffHours = diffTime / (1000 * 60 * 60);
            return sum + diffHours;
          }, 0);
          avgResolutionTime = totalTime / resolvedIssuesData.length;
        }

        setStats({
          totalIssues: totalIssues || 0,
          openIssues: openIssues || 0,
          resolvedIssues: resolvedIssues || 0,
          criticalIssues: criticalIssues || 0,
          avgResolutionTime,
          inventoryItems: inventoryItems || 0,
          lowStockItems: lowStockItems || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate percentages
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const openIssuesPercentage = calculatePercentage(stats.openIssues, stats.totalIssues);
  const resolvedIssuesPercentage = calculatePercentage(stats.resolvedIssues, stats.totalIssues);
  const criticalIssuesPercentage = calculatePercentage(stats.criticalIssues, stats.totalIssues);
  const lowStockPercentage = calculatePercentage(stats.lowStockItems, stats.inventoryItems);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {hasRole(['admin', 'employee']) && <CalendarDateRangePicker />}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4 mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {hasRole(['admin', 'employee']) && (
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalIssues}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalIssues > 0 ? `+${stats.totalIssues} from last month` : 'No issues last month'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.openIssues}</div>
                    <p className="text-xs text-muted-foreground">
                      {openIssuesPercentage}% of total issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.criticalIssues}</div>
                    <p className="text-xs text-muted-foreground">
                      {criticalIssuesPercentage}% of total issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.avgResolutionTime.toFixed(1)} hrs
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For {stats.resolvedIssues} resolved issues
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Issue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <Overview />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>
                  {stats.openIssues} open issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <RecentIssues />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>
                  Distribution of issues by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <IssuesByType />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Issues by Status</CardTitle>
                <CardDescription>
                  Current status of all issues
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <IssuesByStatus />
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Issues by Department</CardTitle>
                <CardDescription>
                  Distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <IssuesByDepartment />
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Trends</CardTitle>
              <CardDescription>
                Average time to resolve issues over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <IssueResolutionTime />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {hasRole(['admin', 'employee']) && (
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M2 10V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v3M2 10v7a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-7" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-[100px]" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.inventoryItems}</div>
                      <p className="text-xs text-muted-foreground">
                        Items in inventory
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 2v5h5" />
                    <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z" />
                    <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
                    <path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-[100px]" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                      <p className="text-xs text-muted-foreground">
                        {lowStockPercentage}% of inventory needs restock
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[100px] w-full" />
                  ) : (
                    <InventoryStatus />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
