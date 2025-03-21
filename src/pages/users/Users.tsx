
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import UserList from '@/components/users/UserList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/dashboard');
    }
  }, [hasRole, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our User type
        const transformedUsers = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          createdAt: new Date(user.created_at)
        }));
        
        setUsers(transformedUsers);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions for the IT support system.
        </p>
      </div>

      <UserList users={users} isLoading={isLoading} />
    </div>
  );
};

export default Users;
