
import { User } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserListProps {
  users: User[];
  isLoading?: boolean;
}

const UserList = ({ users, isLoading = false }: UserListProps) => {
  const { hasRole, hasPermission } = useAuth();
  const canEditUsers = hasRole('admin') || hasPermission('manage_users');
  
  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (users.length === 0) {
    return <div>No users found.</div>;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'employee':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Phone</TableHead>
          {canEditUsers && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{user.department || '-'}</TableCell>
            <TableCell>{user.company || '-'}</TableCell>
            <TableCell>{user.site || '-'}</TableCell>
            <TableCell>{user.phoneNumber || '-'}</TableCell>
            {canEditUsers && (
              <TableCell className="text-right">
                <Link to={`/users/${user.id}/edit`}>
                  <Button size="sm" variant="ghost">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserList;
