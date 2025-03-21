import React, { useState, useEffect } from 'react';
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
import { mapDbIssues, mapDbUsers } from '@/utils/dataMapping';
import { toast } from '@/components/ui/use-toast';

interface IssueListProps {
  issues?: Issue[];
  isLoading?: boolean;
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

const IssueList: React.FC<IssueListProps> = ({ issues: propIssues, isLoading: propIsLoading }) => {
  const { user, hasRole } = useAuth();
  const [issues, setIssues] = useState<Issue[]>(propIssues || []);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(propIsLoading || false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<string>('all');

  useEffect(() => {
    if (propIssues) {
      setIssues(propIssues);
    } else {
      fetchIssues();
    }
  }, [propIssues]);

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchEmployees();
    }
  }, [hasRole]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_users')
        .select('*')
        .eq('role', 'employee');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEmployees(mapDbUsers(data));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('issues').select('*');
      
      if (user && !hasRole(['admin'])) {
        if (hasRole(['employee'])) {
          query = query.eq('assigned_to', user.id);
        } else {
          query = query.eq('submitted_by', user.id);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setIssues(mapDbIssues(data));
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', issueId);
      
      if (error) {
        throw error;
      }
      
      setIssues(issues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: newStatus, updatedAt: new Date() } 
          : issue
      ));

      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      });
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
      
      if (error) {
        throw error;
      }
      
      setIssues(issues.map(issue => 
        issue.id === issueId 
          ? { 
              ...issue, 
              assignedTo: employeeId, 
              updatedAt: new Date(),
              status: 'in-progress'
            } 
          : issue
      ));

      const assignedEmployee = employees.find(emp => emp.id === employeeId);
      toast({
        title: "Issue Assigned",
        description: `Issue assigned to ${assignedEmployee?.name || 'employee'} and marked as in-progress`,
      });
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast({
        title: "Error",
        description: "Failed to assign issue",
        variant: "destructive",
      });
    }
  };

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
        
        <TabsContent value="all" className="mt-6">
          {renderIssueList(filteredIssues, isLoading, handleStatusChange, handleAssignIssue, employees, hasRole(['admin']))}
        </TabsContent>
        
        <TabsContent value="mine" className="mt-6">
          {renderIssueList(filteredIssues, isLoading, handleStatusChange, handleAssignIssue, employees, hasRole(['admin']))}
        </TabsContent>
        
        <TabsContent value="assigned" className="mt-6">
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
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

export default IssueList;
