import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Issue, DashboardStats } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { mapDbIssues } from '@/utils/dataMapping';
import IssueList from '@/components/issues/IssueList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInHours } from 'date-fns';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all issues for statistics
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (issuesError) throw issuesError;
        
        // Fetch low stock items (quantity < 3)
        const { data: stockData, error: stockError } = await supabase
          .from('stock_items')
          .select('*')
          .lt('quantity', 3);
        
        if (stockError) throw stockError;
        
        // Map to frontend format
        const issues = mapDbIssues(issuesData || []);
        
        // Calculate statistics
        const issuesByStatus: Record<string, number> = {
          'submitted': 0,
          'in-progress': 0,
          'resolved': 0,
          'escalated': 0
        };
        
        const issuesByType: Record<string, number> = {
          'hardware': 0,
          'software': 0,
          'network': 0
        };
        
        // Only calculate for resolved issues
        const resolvedIssues = issues.filter(issue => issue.status === 'resolved' && issue.resolvedAt);
        let totalResolutionTime = 0;
        
        issues.forEach(issue => {
          // Count by status
          if (issuesByStatus[issue.status] !== undefined) {
            issuesByStatus[issue.status]++;
          }
          
          // Count by type
          if (issuesByType[issue.type] !== undefined) {
            issuesByType[issue.type]++;
          }
          
          // Calculate resolution time for resolved issues
          if (issue.status === 'resolved' && issue.resolvedAt) {
            const hours = differenceInHours(new Date(issue.resolvedAt), new Date(issue.createdAt));
            totalResolutionTime += hours;
          }
        });
        
        // Calculate average resolution time
        const averageResolutionTime = resolvedIssues.length > 0 
          ? totalResolutionTime / resolvedIssues.length 
          : 0;
        
        // Get recent issues (last 5)
        const recentIssues = issues
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        // Set the statistics
        setStats({
          totalIssues: issues.length,
          issuesByStatus: issuesByStatus as Record<Issue['status'], number>,
          issuesByType: issuesByType as Record<Issue['type'], number>,
          averageResolutionTime,
          lowStockItems: stockData?.length || 0,
          recentIssues
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl">No dashboard data available</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of IT support system statistics and recent activities.
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.issuesByStatus.submitted + stats.issuesByStatus['in-progress']}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageResolutionTime)} hours
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabbed Content */}
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Issues</TabsTrigger>
          <TabsTrigger value="my-issues">My Issues</TabsTrigger>
        </TabsList>
        
        {/* Recent Issues */}
        <TabsContent value="recent" className="space-y-4">
          <IssueList issues={stats.recentIssues} />
        </TabsContent>
        
        {/* My Issues (if user is not admin) */}
        <TabsContent value="my-issues" className="space-y-4">
          {hasRole(['user']) ? (
            <IssueList issues={stats.recentIssues.filter(issue => issue.submittedBy === user?.id)} />
          ) : hasRole(['employee']) ? (
            <IssueList issues={stats.recentIssues.filter(issue => issue.assignedTo === user?.id)} />
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">As an admin, you can view all issues from the Issues page.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
