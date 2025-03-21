
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

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
      // Handle demo emails
      const normalizedEmail = email.includes('@example.com') 
        ? email.replace('@example.com', '@gmail.com') 
        : email;
        
      await login(normalizedEmail, password);
      navigate('/dashboard');
    } catch (error) {
      // Error already handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUserIfNeeded = async (email: string, password: string, name: string, role: string, department?: string) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, directly set these values
      setEmail(email);
      setPassword('password'); // All demo users have password='password'
      
      // Try to log in first
      try {
        // Login will handle normalizing the email
        await login(email, 'password');
        navigate('/dashboard');
        return;
      } catch (error) {
        console.log("Login failed, user might not exist yet");
        // If the demo user doesn't exist yet, it will be created in the next step
      }
      
      // At this point we know the user already exists in the custom_users table
      // because we added them in our SQL migration, so we just show an error message
      toast({
        title: "Demo Account Info",
        description: `Use email: ${email} with password: password to log in.`,
      });
    } catch (error: any) {
      console.error("Error with demo user:", error);
      toast({
        title: "Error With Demo User",
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
          For demo purposes, all accounts use the password "password".
        </p>
      </div>
    </div>
  );
};

export default Index;
