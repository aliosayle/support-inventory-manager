
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import UserForm from '@/components/users/UserForm';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const NewUser = () => {
  const navigate = useNavigate();
  const { hasRole, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not admin or doesn't have manage_users permission
  useEffect(() => {
    if (!hasRole('admin') && !hasPermission('manage_users')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create users.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [hasRole, hasPermission, navigate]);

  const handleSubmit = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    
    try {
      // In a real app, we would hash the password first
      // For demo purposes, we're storing a fake hash
      const passwordHash = '$2a$10$b8Ycw7tIHgsfoLHyYQ.YaOG45hR1askYWQuALEbTZ9bR6T1qsQzLa'; // Pretend hash of 'password'
      
      // Create the new user
      const { error } = await supabase
        .from('custom_users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          name: userData.name,
          role: userData.role,
          department: userData.department,
          company: userData.company,
          site: userData.site,
          phone_number: userData.phoneNumber,
          permissions: userData.permissions || []
        });
      
      if (error) {
        throw error;
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
