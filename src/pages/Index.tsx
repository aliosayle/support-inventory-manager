
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
      // TEMPORARY: The bypassed login will accept any credentials
      await login(email || 'admin@example.com', password || 'password');
      navigate('/dashboard');
    } catch (error) {
      // Error already handled in auth context
      console.log('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoUserIfNeeded = async (email: string, password: string, name: string, role: string, department?: string) => {
    setIsLoading(true);
    
    try {
      // TEMPORARY: Just use the bypass login with the selected demo credentials
      setEmail(email);
      await login(email, 'password');
      navigate('/dashboard');
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
          <p className="text-muted-foreground">
            Login to access the dashboard
          </p>
        </div>
        
        <Alert variant="warning" className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>TEMPORARY AUTH BYPASS ACTIVE</strong>: Any credentials will work, no validation needed.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-6 bg-card rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter any email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter any password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login (Bypassed)'}
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
          <strong>Temporary Bypass Mode:</strong> Authentication checks are disabled.
        </p>
      </div>
    </div>
  );
};

export default Index;
