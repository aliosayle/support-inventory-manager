
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Laptop,
  Server,
  Share2
} from 'lucide-react';
import { Issue, User } from '@/types';
import { getUserById } from '@/utils/mockData';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface IssueListProps {
  issues: Issue[];
  onUpdateStatus?: (issueId: string, status: string) => void;
}

const IssueList = ({ issues, onUpdateStatus }: IssueListProps) => {
  const { hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesType = typeFilter === 'all' || issue.type === typeFilter;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'escalated': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'submitted': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hardware': return <Laptop size={16} />;
      case 'software': return <Laptop size={16} />;
      case 'network': return <Share2 size={16} />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'escalated': return <AlertTriangle size={16} />;
      case 'submitted': return <Server size={16} />;
      default: return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Filter size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="network">Network</SelectItem>
            </SelectContent>
          </Select>
          {hasRole(['admin', 'user']) && (
            <Button asChild>
              <Link to="/issues/new">New Issue</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Submitted By</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No issues found
                </TableCell>
              </TableRow>
            ) : (
              filteredIssues.map((issue) => {
                const submitter = getUserById(issue.submittedBy) as User;
                
                return (
                  <TableRow key={issue.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{issue.title}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline-block mt-1">
                          {issue.description.substring(0, 60)}
                          {issue.description.length > 60 ? '...' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {submitter?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(issue.type)}
                        <span className="capitalize">{issue.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize", getSeverityColor(issue.severity))}
                      >
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize flex w-fit items-center gap-1", getStatusColor(issue.status))}
                      >
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(issue.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/issues/${issue.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {hasRole(['admin', 'employee']) && (
                            <DropdownMenuItem asChild>
                              <Link to={`/issues/${issue.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {hasRole(['admin', 'employee']) && onUpdateStatus && issue.status !== 'resolved' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, 'resolved')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          )}
                          {hasRole(['admin', 'employee']) && onUpdateStatus && issue.status !== 'in-progress' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(issue.id, 'in-progress')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark as In Progress
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IssueList;
