
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, Issue } from '@/types';
import {
  ClipboardList,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import IssueList from '@/components/issues/IssueList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getIssuesByStatus, 
  getIssuesByAssignee, 
  getIssuesBySubmitter, 
  issues, 
  getLowStockItems,
  updateIssue,
} from '@/utils/mockData';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    issuesByStatus: {
      submitted: 0,
      'in-progress': 0,
      resolved: 0,
      escalated: 0,
    },
    issuesByType: {
      hardware: 0,
      software: 0,
      network: 0,
    },
    averageResolutionTime: 0,
    lowStockItems: 0,
    recentIssues: [],
  });
  const [myIssues, setMyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // Calculate statistics
    const totalIssues = issues.length;
    const submitted = getIssuesByStatus('submitted').length;
    const inProgress = getIssuesByStatus('in-progress').length;
    const resolved = getIssuesByStatus('resolved').length;
    const escalated = getIssuesByStatus('escalated').length;
    
    // Count issues by type
    const hardwareIssues = issues.filter(issue => issue.type === 'hardware').length;
    const softwareIssues = issues.filter(issue => issue.type === 'software').length;
    const networkIssues = issues.filter(issue => issue.type === 'network').length;
    
    // Calculate average resolution time
    const resolvedIssues = issues.filter(issue => issue.status === 'resolved' && issue.resolvedAt);
    let avgResolutionTime = 0;
    
    if (resolvedIssues.length > 0) {
      const totalResolutionTimeHours = resolvedIssues.reduce((total, issue) => {
        if (issue.resolvedAt) {
          const diff = issue.resolvedAt.getTime() - issue.createdAt.getTime();
          const hours = diff / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);
      
      avgResolutionTime = Math.round(totalResolutionTimeHours / resolvedIssues.length);
    }
    
    // Get the 5 most recent issues
    const recentIssues = [...issues]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    // Count low stock items
    const lowStockCount = getLowStockItems().length;
    
    setStats({
      totalIssues,
      issuesByStatus: {
        submitted,
        'in-progress': inProgress,
        resolved,
        escalated,
      },
      issuesByType: {
        hardware: hardwareIssues,
        software: softwareIssues,
        network: networkIssues,
      },
      averageResolutionTime: avgResolutionTime,
      lowStockItems: lowStockCount,
      recentIssues,
    });

    // Set my issues based on role
    if (user) {
      if (hasRole('admin')) {
        // Admin sees all issues
        setMyIssues(recentIssues);
      } else if (hasRole('employee')) {
        // Employee sees assigned issues
        setMyIssues(getIssuesByAssignee(user.id));
      } else {
        // User sees submitted issues
        setMyIssues(getIssuesBySubmitter(user.id));
      }
    }
  }, [user, hasRole]);

  const handleUpdateStatus = (issueId: string, status: string) => {
    try {
      updateIssue(issueId, { status: status as any });
      
      // Update UI
      setMyIssues(prev => 
        prev.map(issue => 
          issue.id === issueId ? { ...issue, status: status as any } : issue
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Issue has been marked as ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <Button onClick={() => navigate('/issues/new')}>Create New Issue</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Issues"
          value={stats.totalIssues}
          icon={<ClipboardList size={18} />}
        />
        <DashboardCard
          title="In Progress"
          value={stats.issuesByStatus['in-progress']}
          icon={<Clock size={18} />}
          description="Issues being worked on"
        />
        <DashboardCard
          title="Resolved"
          value={stats.issuesByStatus.resolved}
          icon={<CheckCircle2 size={18} />}
          description="Issues successfully resolved"
        />
        <DashboardCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<Package size={18} />}
          description="Items that need to be restocked"
        />
      </div>

      <Tabs defaultValue="myIssues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="myIssues">
            {hasRole(['admin', 'employee']) ? 'Assigned Issues' : 'My Issues'}
          </TabsTrigger>
          {hasRole(['admin']) && (
            <TabsTrigger value="allIssues">All Issues</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="myIssues" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {hasRole(['admin', 'employee']) ? 'Assigned Issues' : 'My Issues'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IssueList 
                issues={myIssues} 
                onUpdateStatus={handleUpdateStatus} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        {hasRole(['admin']) && (
          <TabsContent value="allIssues" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueList 
                  issues={issues} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
