
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Filter, MoreHorizontal, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'employee': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return '';
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Filter size={16} />
          </Button>
        </div>
        <Button asChild>
          <Link to="/users/new">
            <UserPlus size={16} className="mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{user.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {user.department || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", getRoleBadgeColor(user.role))}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(user.createdAt)}
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
                          <Link to={`/users/${user.id}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/users/${user.id}/edit`}>
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserList;
