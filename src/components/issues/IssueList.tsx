
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Issue, IssueStatus, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Plus, Search, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { mapDbUsers } from '@/utils/dataMapping';

interface IssueListProps {
  issues: Issue[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const getStatusColor = (status: IssueStatus) => {
  switch (status) {
    case 'submitted':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'in-progress':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'resolved':
      return 'bg-green-500 hover:bg-green-600';
    case 'escalated':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const IssueList: React.FC<IssueListProps> = ({ 
  issues, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  currentTab, 
  setCurrentTab 
}) => {
  const { user, hasRole } = useAuth();
  
  // Fetch employees with React Query
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      if (!hasRole(['admin'])) return [];
      
      try {
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('role', 'employee');
        
        if (error) throw error;
        return mapDbUsers(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
    enabled: hasRole(['admin'])
  });

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', issueId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      });
      
      // Let React Query handle the cache invalidation
      await queryClient.invalidateQueries({ queryKey: ['issues'] });
      
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const handleAssignIssue = async (issueId: string, employeeId: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ 
          assigned_to: employeeId,
          updated_at: new Date().toISOString(),
          status: 'in-progress'
        })
        .eq('id', issueId);
      
      if (error) throw error;
      
      const assignedEmployee = employees.find(emp => emp.id === employeeId);
      toast({
        title: "Issue Assigned",
        description: `Issue assigned to ${assignedEmployee?.name || 'employee'} and marked as in-progress`,
      });
      
      // Let React Query handle the cache invalidation
      await queryClient.invalidateQueries({ queryKey: ['issues'] });
      
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast({
        title: "Error",
        description: "Failed to assign issue",
        variant: "destructive",
      });
    }
  };

  // Filter issues based on search, status, and tab
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    
    const matchesTab = currentTab === 'all' || 
      (currentTab === 'mine' && issue.submittedBy === user?.id) ||
      (currentTab === 'assigned' && issue.assignedTo === user?.id);
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search issues..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          
          {hasRole(['admin', 'user']) && (
            <Button asChild>
              <Link to="/issues/new">
                <Plus className="mr-2 h-4 w-4" />
                New Issue
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="mine">My Issues</TabsTrigger>
          {hasRole(['admin', 'employee']) && (
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          )}
        </TabsList>
        
        {/* Render content only once */}
        <TabsContent className="mt-6">
          {renderIssueList(filteredIssues, isLoading, handleStatusChange, handleAssignIssue, employees, hasRole(['admin']))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderIssueList = (
  issues: Issue[], 
  isLoading: boolean, 
  handleStatusChange: (id: string, status: IssueStatus) => void,
  handleAssignIssue: (id: string, employeeId: string) => void,
  employees: User[],
  isAdmin: boolean
) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (issues.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">No issues found</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <Card key={issue.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/issues/${issue.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'submitted')}>
                    Submitted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'in-progress')}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'resolved')}>
                    Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'escalated')}>
                    Escalated
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Assign to Employee</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {employees.length > 0 ? (
                              employees.map(employee => (
                                <DropdownMenuItem 
                                  key={employee.id}
                                  onClick={() => handleAssignIssue(issue.id, employee.id)}
                                >
                                  {employee.name}
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem disabled>No employees found</DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {issue.description}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge variant="outline" className={`${getStatusColor(issue.status)} text-white`}>
              {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
            </Badge>
            <Badge variant="outline">{issue.type}</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Add React Query client reference 
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();

export default IssueList;
