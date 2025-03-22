
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, UserRole, Permission } from '@/types';
import UserForm from '@/components/users/UserForm';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, hasPermission } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not admin or doesn't have manage_users permission
  useEffect(() => {
    if (!hasRole('admin') && !hasPermission('manage_users')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit users.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [hasRole, hasPermission, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole, // Type cast here
            department: data.department,
            company: data.company,
            site: data.site,
            phoneNumber: data.phone_number,
            avatar: data.avatar,
            permissions: data.permissions || [],
            createdAt: new Date(data.created_at)
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch user",
          variant: "destructive",
        });
        navigate('/users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (userData: Partial<User>) => {
    if (!id) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('custom_users')
        .update({
          name: userData.name,
          role: userData.role,
          department: userData.department,
          company: userData.company,
          site: userData.site,
          phone_number: userData.phoneNumber,
          permissions: userData.permissions || []
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      
      // Redirect to users list
      navigate('/users');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">
          Update user information and permissions.
        </p>
      </div>

      <UserForm 
        user={user}
        onSubmit={handleSubmit} 
        isLoading={isSaving}
      />
    </div>
  );
};

export default EditUser;
