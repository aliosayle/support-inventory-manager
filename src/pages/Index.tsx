
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUserIfNeeded = async (email: string, password: string, name: string, role: string, department?: string) => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists, just log them in
        setEmail(email);
        setPassword(password);
        await login(email, password);
        navigate('/dashboard');
        return;
      }
      
      // Create new user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // If user was created successfully, check if auth was set up correctly
      if (data && data.user) {
        // Check if profile exists (should be created by trigger, but just in case)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id);
        
        // If profile doesn't exist yet or role needs to be updated
        if (!profile || profile.length === 0 || profile[0].role !== role) {
          // Update profile with role and department
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name,
              email,
              role,
              department
            });
          
          if (profileError) throw profileError;
        }
        
        // Now login with the created credentials
        await login(email, password);
        navigate('/dashboard');
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error: any) {
      console.error("Error creating demo user:", error);
      toast({
        title: "Error Creating Demo User",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">IT Support Manager</h1>
          <p className="text-muted-foreground">Login to access the dashboard</p>
        </div>
        
        <div className="space-y-6 bg-card rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-center">Demo Accounts</h3>
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('admin@example.com', 'password', 'Admin User', 'admin', 'IT Department')}
                disabled={isLoading}
              >
                Admin Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('john@example.com', 'password', 'John Smith', 'employee', 'IT Support')}
                disabled={isLoading}
              >
                Employee Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => createDemoUserIfNeeded('michael@example.com', 'password', 'Michael Johnson', 'user', 'Marketing')}
                disabled={isLoading}
              >
                User Account
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          For demo purposes, any password will work with these email addresses.
        </p>
      </div>
    </div>
  );
};

export default Index;
