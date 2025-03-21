
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import UserForm from '@/components/users/UserForm';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const NewUser = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not admin
  if (!hasRole('admin')) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    
    try {
      const { password, ...profileData } = userData;
      
      // First create the Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email!,
        password: password!,
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // Update the profile with role and department
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: userData.role,
            department: userData.department
          })
          .eq('id', authData.user.id);
        
        if (profileError) {
          throw profileError;
        }
      }
      
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      
      // Redirect to users list
      navigate('/users');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground">
          Add a new user to the IT support system.
        </p>
      </div>

      <UserForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewUser;
