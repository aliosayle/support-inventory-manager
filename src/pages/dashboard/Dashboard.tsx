
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  LineChart, BarChart, CalendarDays, 
  CheckCircle2, Clock, Package, PackageOpen, 
  ShoppingCart, Users2, AlertTriangle, 
  FileWarning, Database
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseRequestList from '@/components/purchase-request/PurchaseRequestList';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch issue counts by status
        const { data: issueStatusData, error: issueStatusError } = await supabase
          .rpc('get_issues_by_status');

        if (issueStatusError) {
          throw issueStatusError;
        }

        // Fetch issue counts by type
        const { data: issueTypeData, error: issueTypeError } = await supabase
          .rpc('get_issues_by_type');

        if (issueTypeError) {
          throw issueTypeError;
        }

        // Fetch recent issues
        const { data: recentIssues, error: recentIssuesError } = await supabase
          .from('issues')
          .select('*, custom_users!issues_submitted_by_fkey(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentIssuesError) {
          throw recentIssuesError;
        }

        // Fetch low stock items count
        const { data: lowStockData, error: lowStockError } = await supabase
          .from('stock_items')
          .select('id')
          .lt('quantity', 5);

        if (lowStockError) {
          throw lowStockError;
        }

        // Fetch unassigned issues count
        const { data: unassignedData, error: unassignedError } = await supabase
          .from('issues')
          .select('id')
          .is('assigned_to', null)
          .eq('status', 'submitted');

        if (unassignedError) {
          throw unassignedError;
        }

        // Fetch pending purchase requests count
        const { data: pendingPurchaseData, error: pendingPurchaseError } = await supabase
          .from('purchase_requests')
          .select('id')
          .eq('status', 'pending');

        if (pendingPurchaseError) {
          throw pendingPurchaseError;
        }

        // Calculate average resolution time (simplified)
        const avgResolutionTime = 24; // Placeholder: 24 hours

        // Transform data into the format expected by the component
        const issuesByStatus = issueStatusData.reduce((acc: Record<string, number>, item: any) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, { submitted: 0, 'in-progress': 0, resolved: 0, escalated: 0 });

        const issuesByType = issueTypeData.reduce((acc: Record<string, number>, item: any) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, { hardware: 0, software: 0, network: 0 });

        const transformedStats: DashboardStats = {
          totalIssues: Object.values(issuesByStatus).reduce((a, b) => a + b, 0),
          issuesByStatus,
          issuesByType,
          averageResolutionTime: avgResolutionTime,
          lowStockItems: lowStockData.length,
          recentIssues: recentIssues.map((issue: any) => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            submittedBy: issue.submitted_by,
            assignedTo: issue.assigned_to,
            severity: issue.severity,
            type: issue.type,
            status: issue.status,
            createdAt: new Date(issue.created_at),
            updatedAt: new Date(issue.updated_at),
            resolvedAt: issue.resolved_at ? new Date(issue.resolved_at) : undefined,
            submitterName: issue.custom_users?.name || 'Unknown'
          })),
          unassignedIssues: unassignedData.length,
          pendingPurchaseRequests: pendingPurchaseData.length
        };

        setStats(transformedStats);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of IT support system activity and metrics
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Issues"
          value={stats?.totalIssues || 0}
          description="All reported issues"
          icon={FileWarning}
          trend={{
            value: 5,
            isUpward: true,
            label: "from last week"
          }}
        />
        
        <DashboardCard
          title="Unresolved Issues"
          value={(stats?.issuesByStatus?.submitted || 0) + (stats?.issuesByStatus?.['in-progress'] || 0) + (stats?.issuesByStatus?.escalated || 0)}
          description="Issues pending resolution"
          icon={AlertTriangle}
          trend={{
            value: 2,
            isUpward: false,
            label: "from last week"
          }}
        />
        
        <DashboardCard
          title="Resolved Issues"
          value={stats?.issuesByStatus?.resolved || 0}
          description="Successfully resolved"
          icon={CheckCircle2}
          trend={{
            value: 10,
            isUpward: true,
            label: "from last week"
          }}
        />
        
        <DashboardCard
          title="Average Resolution Time"
          value={stats?.averageResolutionTime || 0}
          description="Hours to resolve"
          icon={Clock}
          suffix="h"
          trend={{
            value: 1.5,
            isUpward: false,
            label: "better than last month"
          }}
        />
        
        <DashboardCard
          title="Low Stock Items"
          value={stats?.lowStockItems || 0}
          description="Items to reorder"
          icon={PackageOpen}
          trend={{
            value: 3,
            isUpward: true,
            label: "from last month"
          }}
        />
        
        <DashboardCard
          title="Recent Activity"
          value={(new Date()).toLocaleDateString()}
          description="Last system update"
          icon={CalendarDays}
        />

        {/* Additional cards for admin users */}
        {hasRole('admin') && (
          <>
            <DashboardCard
              title="Unassigned Issues"
              value={stats?.unassignedIssues || 0}
              description="Need attention"
              icon={FileWarning}
              variant="warning"
            />
            
            <DashboardCard
              title="Pending Purchases"
              value={stats?.pendingPurchaseRequests || 0}
              description="Approval needed"
              icon={ShoppingCart}
              variant="default"
            />
            
            <DashboardCard
              title="Total Inventory"
              value="View"
              description="Manage stock items"
              icon={Database}
              variant="outline"
              link="/stock"
            />
          </>
        )}
      </div>

      <Tabs defaultValue="recent-issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-issues">Recent Issues</TabsTrigger>
          {hasRole('admin') && (
            <TabsTrigger value="purchase-requests">Purchase Requests</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="recent-issues" className="space-y-4">
          {stats?.recentIssues && stats.recentIssues.length > 0 ? (
            <div className="rounded-md border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-2 px-4 text-left font-medium">Title</th>
                    <th className="py-2 px-4 text-left font-medium">Submitted By</th>
                    <th className="py-2 px-4 text-left font-medium">Status</th>
                    <th className="py-2 px-4 text-left font-medium">Type</th>
                    <th className="py-2 px-4 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentIssues.map((issue) => (
                    <tr key={issue.id} className="border-t hover:bg-muted/25">
                      <td className="py-2 px-4">{issue.title}</td>
                      <td className="py-2 px-4">{issue.submitterName}</td>
                      <td className="py-2 px-4 capitalize">{issue.status.replace('-', ' ')}</td>
                      <td className="py-2 px-4 capitalize">{issue.type}</td>
                      <td className="py-2 px-4">{new Date(issue.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent issues found.
            </div>
          )}
        </TabsContent>
        
        {hasRole('admin') && (
          <TabsContent value="purchase-requests" className="space-y-4">
            <PurchaseRequestList limit={3} showActions />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
